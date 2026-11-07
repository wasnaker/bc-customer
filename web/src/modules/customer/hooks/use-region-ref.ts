import { useQuery } from "@tanstack/react-query";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  useGetRegionProvincesService,
  useGetRegionRegenciesService,
} from "../services/region-ref-api";
import type {
  RegionProvinceRef,
  RegionRegencyRef,
} from "../services/region-ref-api";

/**
 * Data referensi region untuk pilihan alamat. Data wilayah hampir tidak
 * berubah — pakai staleTime panjang agar select tidak refetch terus.
 */

const REGION_REF_STALE_TIME = 10 * 60 * 1000;

export function useProvinceOptions() {
  const service = useGetRegionProvincesService();
  return useQuery({
    queryKey: ["customer", "ref", "provinces"],
    queryFn: async () => {
      const res = await service();
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load provinces");
      }
      return (res.data.data ?? []) as RegionProvinceRef[];
    },
    staleTime: REGION_REF_STALE_TIME,
  });
}

export function useRegencyOptions(provinceId: number | string | null) {
  const service = useGetRegionRegenciesService();
  return useQuery({
    queryKey: ["customer", "ref", "regencies", String(provinceId)],
    queryFn: async () => {
      const res = await service({
        provinceId: provinceId as number | string,
      });
      if (res.status !== HTTP_CODES_ENUM.OK || !res.data) {
        throw new Error("Failed to load regencies");
      }
      return (res.data.data ?? []) as RegionRegencyRef[];
    },
    enabled: provinceId != null && provinceId !== "",
    staleTime: REGION_REF_STALE_TIME,
  });
}
