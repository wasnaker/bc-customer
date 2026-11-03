import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTable } from "@/core/table/use-table";
import { SortEnum } from "@/services/api/types/sort-type";
import {
  useGetCustomersService,
  useGetCustomerService,
  useCreateCustomerService,
  useUpdateCustomerService,
  useDeleteCustomerService,
  useGetCustomerDocumentsService,
  useCreateCustomerDocumentService,
  useUpdateCustomerDocumentService,
  useDeleteCustomerDocumentService,
} from "../services/customer-api";
import { CustomerApiError } from "../services/api-error";
import type { SearchableSelectOption } from "../components/searchable-select";
import type { Customer, CustomerDocument } from "../types/customer";

function assertOk(status: number, data: unknown): void {
  if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
    const errors = (data as { errors?: Record<string, string> } | undefined)
      ?.errors;
    if (errors && typeof errors === "object") {
      throw new CustomerApiError(errors);
    }
    throw new CustomerApiError({ unknown: "unknown" });
  }
}

// ── List (server-side, dipakai SmallTable + useTable) ───────────────────────

export function useCustomersServerSide() {
  const service = useGetCustomersService();
  return useTable<Customer>({
    queryKey: ["customer", "customers"],
    searchDebounce: 300,
    defaultSort: { field: "name", order: "ASC" },
    fetchFn: async ({ page, limit, search, sort, signal }) => {
      // Endpoint customer memakai `filters[name]` (ILike), bukan param `search`.
      const filters = search ? { name: search } : undefined;

      const res = await service(
        {
          page,
          limit,
          filters,
          sort: sort
            ? [
                {
                  orderBy: sort.field as keyof Customer,
                  order: sort.order === "ASC" ? SortEnum.ASC : SortEnum.DESC,
                },
              ]
            : undefined,
        },
        { signal },
      );

      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load customers");
      }

      return {
        data: res.data.data ?? [],
        total: typeof res.data.total === "number" ? res.data.total : 0,
      };
    },
  });
}

// ── Detail ──────────────────────────────────────────────────────────────────

export function useCustomer(id: string | null) {
  const service = useGetCustomerService();
  return useQuery({
    queryKey: ["customer", "customer", id],
    queryFn: async () => {
      const res = await service({ id: id as string });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load customer");
      }
      return res.data;
    },
    enabled: id != null,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateCustomer() {
  const service = useCreateCustomerService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof service>[0]) => {
      const res = await service(data);
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to save customer");
      }
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const service = useUpdateCustomerService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: Customer["id"];
      data: Parameters<typeof service>[0]["data"];
    }) => {
      const res = await service({ id, data });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to save customer");
      }
      return res.data;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["customer", "customers"] });
      qc.invalidateQueries({ queryKey: ["customer", "customer", vars.id] });
    },
  });
}

export function useDeleteCustomer() {
  const service = useDeleteCustomerService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: Customer["id"] }) => {
      const res = await service({ id });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete customer");
      }
      return undefined;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer"] });
    },
  });
}

// ── Options untuk SearchableSelect (pemilih customer) ───────────────────────

/**
 * Fetcher opsi customer untuk SearchableSelect — search dikirim sebagai
 * `filters[name]` (ILike) ke server, tidak pernah fetch-all di client.
 */
export function useCustomerOptionsFetcher() {
  const service = useGetCustomersService();
  return useCallback(
    async (
      search: string,
      signal?: AbortSignal,
    ): Promise<SearchableSelectOption[]> => {
      const res = await service(
        {
          page: 1,
          limit: 50,
          filters: search ? { name: search } : undefined,
        },
        { signal },
      );
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load customers");
      }
      return (res.data.data ?? []).map((customer) => ({
        value: String(customer.id),
        label: customer.name,
        hint: customer.code ?? undefined,
      }));
    },
    [service],
  );
}

// ── Documents (polymorphic) ─────────────────────────────────────────────────

export function useCustomerDocuments(
  ownerType: CustomerDocument["ownerType"],
  ownerId: string | null,
  page = 1,
  limit = 20,
) {
  const service = useGetCustomerDocumentsService();
  return useQuery({
    queryKey: ["customer", "documents", ownerType, ownerId, page, limit],
    queryFn: async () => {
      const res = await service({
        ownerType,
        ownerId: ownerId as string,
        page,
        limit,
      });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load documents");
      }
      return res.data;
    },
    enabled: ownerId != null,
  });
}

export function useCreateCustomerDocument() {
  const service = useCreateCustomerDocumentService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof service>[0]) => {
      const res = await service(data);
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to save document");
      }
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "documents"] });
    },
  });
}

export function useUpdateCustomerDocument() {
  const service = useUpdateCustomerDocumentService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: CustomerDocument["id"];
      data: Parameters<typeof service>[0]["data"];
    }) => {
      const res = await service({ id, data });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to save document");
      }
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "documents"] });
    },
  });
}

export function useDeleteCustomerDocument() {
  const service = useDeleteCustomerDocumentService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: CustomerDocument["id"] }) => {
      const res = await service({ id });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete document");
      }
      return undefined;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "documents"] });
    },
  });
}
