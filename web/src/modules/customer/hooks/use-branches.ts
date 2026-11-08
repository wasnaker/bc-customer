import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTable } from "@/core/table/use-table";
import { SortEnum } from "@/services/api/types/sort-type";
import {
  useGetBranchesService,
  useGetBranchService,
  useCreateBranchService,
  useUpdateBranchService,
  useDeleteBranchService,
} from "../services/branch-api";
import { CustomerApiError } from "../services/api-error";
import type { Branch } from "../types/customer";

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

// ── List per customer (server-side, dipakai SmallTable + useTable) ──────────

export function useBranchesServerSide(customerId: string | null) {
  const service = useGetBranchesService();
  return useTable<Branch>({
    queryKey: ["customer", "branches", customerId ?? "none"],
    searchDebounce: 300,
    defaultSort: { field: "name", order: "ASC" },
    fetchFn: async ({ page, limit, search, sort, signal }) => {
      // Tanpa customer terpilih → list GLOBAL (semua branch); dengan customer
      // → difilter server-side via query param customerId.

      // Search → `filters[name]` (ILike); search dikombinasikan dengan filter lain.
      const filters: Record<string, string> = {};
      if (search) filters.name = search;

      const res = await service(
        {
          customerId: customerId ?? undefined,
          page,
          limit,
          filters: Object.keys(filters).length ? filters : undefined,
          sort: sort
            ? [
                {
                  orderBy: sort.field as keyof Branch,
                  order: sort.order === "ASC" ? SortEnum.ASC : SortEnum.DESC,
                },
              ]
            : undefined,
        },
        { signal },
      );

      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load branches");
      }

      return {
        data: res.data.data ?? [],
        total: typeof res.data.total === "number" ? res.data.total : 0,
      };
    },
  });
}

/** List ringkas untuk select (mis. cascade customer → branch di Staff page). */
export function useBranchesOptions(customerId: string | null, limit = 50) {
  const service = useGetBranchesService();
  return useQuery({
    queryKey: ["customer", "branches", "options", customerId, limit],
    queryFn: async () => {
      if (customerId == null) return [] as Branch[];
      const res = await service({ customerId, page: 1, limit });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load branches");
      }
      return res.data.data ?? [];
    },
    enabled: customerId != null,
  });
}

/**
 * Deteksi kantor pusat customer (max 1). Memakai filter `isHeadOffice=true`
 * dengan limit 1 — cukup untuk tahu "sudah ada atau belum".
 */
export function useHeadOffice(customerId: string | null) {
  const service = useGetBranchesService();
  return useQuery({
    queryKey: ["customer", "head-office", customerId],
    queryFn: async () => {
      const res = await service({
        customerId: customerId as string,
        page: 1,
        limit: 1,
        filters: { isHeadOffice: true },
      });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load head office");
      }
      return (res.data.data ?? [])[0] ?? null;
    },
    enabled: customerId != null,
  });
}

// ── Detail ──────────────────────────────────────────────────────────────────

export function useBranch(id: string | null) {
  const service = useGetBranchService();
  return useQuery({
    queryKey: ["customer", "branch", id],
    queryFn: async () => {
      const res = await service({ id: id as string });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load branch");
      }
      return res.data;
    },
    enabled: id != null,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateBranch() {
  const service = useCreateBranchService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof service>[0]) => {
      const res = await service(data);
      assertOk(res.status, res.data);
      if (
        (res.status !== HTTP_CODES_ENUM.OK &&
          res.status !== HTTP_CODES_ENUM.CREATED) ||
        !res.data
      ) {
        throw new Error("Failed to save branch");
      }
      return res.data;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({
        queryKey: ["customer", "branches", vars.customerId],
      });
      qc.invalidateQueries({
        queryKey: ["customer", "head-office", vars.customerId],
      });
    },
  });
}

export function useUpdateBranch() {
  const service = useUpdateBranchService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: Branch["id"];
      data: Parameters<typeof service>[0]["data"];
    }) => {
      const res = await service({ id, data });
      assertOk(res.status, res.data);
      if (
        (res.status !== HTTP_CODES_ENUM.OK &&
          res.status !== HTTP_CODES_ENUM.CREATED) ||
        !res.data
      ) {
        throw new Error("Failed to save branch");
      }
      return res.data;
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["customer", "branches"] });
      qc.invalidateQueries({
        queryKey: ["customer", "head-office", String(res.customerId)],
      });
      qc.invalidateQueries({ queryKey: ["customer", "branch"] });
    },
  });
}

export function useDeleteBranch() {
  const service = useDeleteBranchService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: Branch["id"] }) => {
      const res = await service({ id });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete branch");
      }
      return undefined;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer"] });
    },
  });
}
