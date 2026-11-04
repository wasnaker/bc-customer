import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTable } from "@/core/table/use-table";
import { SortEnum } from "@/services/api/types/sort-type";
import {
  useGetStaffService,
  useGetStaffByIdService,
  useCreateStaffService,
  useUpdateStaffService,
  useDeleteStaffService,
} from "../services/staff-api";
import { CustomerApiError } from "../services/api-error";
import type { Staff } from "../types/customer";

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

// ── List per branch (server-side, dipakai SmallTable + useTable) ────────────

export function useStaffServerSide(branchId: string | null) {
  const service = useGetStaffService();
  return useTable<Staff>({
    queryKey: ["customer", "staff", branchId ?? "none"],
    searchDebounce: 300,
    defaultSort: { field: "name", order: "ASC" },
    fetchFn: async ({ page, limit, search, sort, signal }) => {
      // Tanpa branch terpilih → list GLOBAL (semua staff); dengan branch
      // → difilter server-side via query param branchId.

      // Search → `filters[name]` (ILike); search dikombinasikan dengan filter lain.
      const filters: Record<string, string> = {};
      if (search) filters.name = search;

      const res = await service(
        {
          branchId: branchId ?? undefined,
          page,
          limit,
          filters: Object.keys(filters).length ? filters : undefined,
          sort: sort
            ? [
                {
                  orderBy: sort.field as keyof Staff,
                  order: sort.order === "ASC" ? SortEnum.ASC : SortEnum.DESC,
                },
              ]
            : undefined,
        },
        { signal },
      );

      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load staff");
      }

      return {
        data: res.data.data ?? [],
        total: typeof res.data.total === "number" ? res.data.total : 0,
      };
    },
  });
}

// ── Detail ──────────────────────────────────────────────────────────────────

export function useStaff(id: string | null) {
  const service = useGetStaffByIdService();
  return useQuery({
    queryKey: ["customer", "staff", "detail", id],
    queryFn: async () => {
      const res = await service({ id: id as string });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load staff");
      }
      return res.data;
    },
    enabled: id != null,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateStaff() {
  const service = useCreateStaffService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof service>[0]) => {
      const res = await service(data);
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to save staff");
      }
      return res.data;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({
        queryKey: ["customer", "staff", String(vars.branchId)],
      });
    },
  });
}

export function useUpdateStaff() {
  const service = useUpdateStaffService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: Staff["id"];
      data: Parameters<typeof service>[0]["data"];
    }) => {
      const res = await service({ id, data });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to save staff");
      }
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "staff"] });
    },
  });
}

export function useDeleteStaff() {
  const service = useDeleteStaffService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: Staff["id"] }) => {
      const res = await service({ id });
      assertOk(res.status, res.data);
      if (res.status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete staff");
      }
      return undefined;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer"] });
    },
  });
}
