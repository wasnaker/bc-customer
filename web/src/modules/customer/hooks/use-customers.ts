import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  useGetProvincesService,
  useGetProvinceService,
  useCreateProvinceService,
  useUpdateProvinceService,
  useDeleteProvinceService,
  useGetRegenciesService,
  useGetRegencyService,
  useCreateRegencyService,
  useUpdateRegencyService,
  useDeleteRegencyService,
} from "../services/customer-api";
import type { Province, Regency } from "../types/customer";
import { useTable } from "@/core/table/use-table";
import { SortEnum } from "@/services/api/types/sort-type";

// ── Province hooks ─────────────────────────────────────────────────────────

export function useProvinces(
  page = 1,
  limit = 10,
  filters?: Record<string, string | number | boolean>
) {
  const service = useGetProvincesService();
  return useQuery({
    queryKey: ["customer", "provinces", page, limit, filters],
    queryFn: async () => {
      const res = await service({ page, limit, filters });
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data.errors).join(", "));
      }
      return res.data;
    },
  });
}

/**
 * Hook server-side untuk provinces — menggunakan useTable.
 * Search, filter, sorting, dan pagination diterapkan backend sebelum
 * pagination; total selalu berasal dari hasil count backend.
 */
export function useProvincesServerSide() {
  const service = useGetProvincesService();
  return useTable<Province>({
    queryKey: ["customer", "provinces"],
    // Default page size mengikuti Core Settings.
    searchDebounce: 300,
    defaultSort: { field: "name", order: "ASC" },
    fetchFn: async ({ page, limit, search, sort, filters, signal }) => {
      // Search digabung dengan filter lain, bukan menggantikan filter yang ada.
      const activeFilters = Object.fromEntries(
        Object.entries(filters ?? {}).filter(([, value]) => value != null)
      ) as Record<string, string | number | boolean>;

      if (search) activeFilters.search = search;

      const res = await service(
        {
          page,
          limit,
          filters: Object.keys(activeFilters).length ? activeFilters : undefined,
          sort: sort
            ? [{
                orderBy: sort.field as keyof Province,
                order: sort.order === "ASC" ? SortEnum.ASC : SortEnum.DESC,
              }]
            : undefined,
        },
        { signal }
      );

      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data?.errors ?? {}).join(", "));
      }
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Gagal memuat data provinsi");
      }

      // Endpoint Customer mengembalikan total hasil SETELAH filter/search.
      // Jangan mengestimasi total dari hasNextPage karena pagination bisa salah.
      const response = res.data as {
        data?: Province[];
        total?: number;
      };
      if (typeof response.total !== "number") {
        throw new Error("Respons API provinsi tidak menyertakan total hasil");
      }

      return {
        data: response.data ?? [],
        total: response.total,
      };
    },
  });
}

export function useProvince(id: Province["id"] | null) {
  const service = useGetProvinceService();
  return useQuery({
    queryKey: ["customer", "province", id],
    queryFn: async () => {
      const res = await service({ id: id as Province["id"] });
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data.errors).join(", "));
      }
      return res.data;
    },
    enabled: id != null,
  });
}

export function useCreateProvince() {
  const service = useCreateProvinceService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof service>[0]) => {
      const res = await service(data);
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data.errors).join(", "));
      }
      if (!res.data) throw new Error("Failed to save province");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "provinces"] });
    },
  });
}

export function useUpdateProvince() {
  const service = useUpdateProvinceService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: Province["id"];
      data: Parameters<typeof service>[0]["data"];
    }) => {
      const res = await service({ id, data });
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data.errors).join(", "));
      }
      if (!res.data) throw new Error("Failed to save province");
      return res.data;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["customer", "provinces"] });
      qc.invalidateQueries({ queryKey: ["customer", "province", vars.id] });
    },
  });
}

export function useDeleteProvince() {
  const service = useDeleteProvinceService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: Province["id"] }) => {
      const res = await service({ id });
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data.errors).join(", "));
      }
      if (res.status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete province");
      }
      return undefined;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "provinces"] });
    },
  });
}

// ── Regency hooks ──────────────────────────────────────────────────────────

export function useRegencies(
  provinceId: Province["id"] | null,
  page = 1,
  limit = 10
) {
  const service = useGetRegenciesService();
  return useQuery({
    queryKey: ["customer", "regencies", provinceId, page, limit],
    queryFn: async () => {
      const res = await service({
        page,
        limit,
        filters:
          provinceId != null ? { provinceId: String(provinceId) } : undefined,
      });
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data.errors).join(", "));
      }
      return res.data;
    },
    enabled: provinceId != null,
  });
}

export function useRegency(id: Regency["id"] | null) {
  const service = useGetRegencyService();
  return useQuery({
    queryKey: ["customer", "regency", id],
    queryFn: async () => {
      const res = await service({ id: id as Regency["id"] });
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data.errors).join(", "));
      }
      return res.data;
    },
    enabled: id != null,
  });
}

export function useCreateRegency() {
  const service = useCreateRegencyService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof service>[0]) => {
      const res = await service(data);
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data.errors).join(", "));
      }
      if (!res.data) throw new Error("Failed to save regency");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "regencies"] });
    },
  });
}

export function useUpdateRegency() {
  const service = useUpdateRegencyService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: Regency["id"];
      data: Parameters<typeof service>[0]["data"];
    }) => {
      const res = await service({ id, data });
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data.errors).join(", "));
      }
      if (!res.data) throw new Error("Failed to save regency");
      return res.data;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["customer", "regencies"] });
      qc.invalidateQueries({ queryKey: ["customer", "regency", vars.id] });
    },
  });
}

export function useDeleteRegency() {
  const service = useDeleteRegencyService();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: Regency["id"] }) => {
      const res = await service({ id });
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(Object.values(res.data.errors).join(", "));
      }
      if (res.status !== HTTP_CODES_ENUM.NO_CONTENT) {
        throw new Error("Failed to delete regency");
      }
      return undefined;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "regencies"] });
    },
  });
}
