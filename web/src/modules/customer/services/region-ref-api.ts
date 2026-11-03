import { useCallback } from "react";
import useFetch from "@/services/api/use-fetch";
import { API_URL } from "@/services/api/config";
import wrapperFetchJsonResponse from "@/services/api/wrapper-fetch-json-response";
import type { RequestConfigType } from "@/services/api/services/types/request-config";

/**
 * Data referensi alamat milik modul Region (endpoint JWT-only yang sudah
 * berjalan di produksi). Modul customer TIDAK menduplikasi entity region —
 * hanya membaca daftar province & regency untuk pilihan alamat.
 */

export interface RegionProvinceRef {
  id: number | string;
  name: string;
}

export interface RegionRegencyRef {
  id: number | string;
  provinceId: number | string;
  name: string;
}

type RegionRefListResponse<T> = {
  data: T[];
  total?: number;
  hasNextPage?: boolean;
};

export function useGetRegionProvincesService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) => {
      const url = new URL(`${API_URL}/v1/region/provinces`);
      url.searchParams.append("page", "1");
      // Provinsi Indonesia < 40 — satu halaman cukup.
      url.searchParams.append("limit", "100");
      return fetch(url, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<RegionRefListResponse<RegionProvinceRef>>,
      );
    },
    [fetch],
  );
}

export function useGetRegionRegenciesService() {
  const fetch = useFetch();
  return useCallback(
    (
      data: { provinceId: number | string; limit?: number },
      requestConfig?: RequestConfigType,
    ) => {
      const url = new URL(`${API_URL}/v1/region/regencies`);
      url.searchParams.append("page", "1");
      // Kabupaten/kota terbanyak per provinsi < 100 — satu halaman cukup.
      url.searchParams.append("limit", String(data.limit ?? 100));
      url.searchParams.append(
        "filters",
        JSON.stringify({ provinceId: String(data.provinceId) }),
      );
      return fetch(url, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<RegionRefListResponse<RegionRegencyRef>>,
      );
    },
    [fetch],
  );
}
