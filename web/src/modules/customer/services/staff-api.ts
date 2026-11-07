import { useCallback } from "react";
import useFetch from "@/services/api/use-fetch";
import { API_URL } from "@/services/api/config";
import wrapperFetchJsonResponse from "@/services/api/wrapper-fetch-json-response";
import type { SortEnum } from "@/services/api/types/sort-type";
import type { RequestConfigType } from "@/services/api/services/types/request-config";
import type { CustomerPagination, Staff } from "../types/customer";

// ── Staff (nested di bawah branch) ──────────────────────────────────────────

export type StaffListRequest = {
  /** Opsional — bila kosong, list global (semua staff lintas branch). */
  branchId?: Staff["branchId"] | null;
  /** Opsional — filter via branch.customerId (customer dipilih, cabang belum). */
  customerId?: Staff["branchId"] | null;
  page: number;
  limit: number;
  /** Filter API: `name` (ILike) & `isActive`. Search dipetakan ke `name`. */
  filters?: Record<string, string | number | boolean>;
  sort?: Array<{ orderBy: keyof Staff; order: SortEnum }>;
};

export type StaffListResponse = CustomerPagination<Staff>;

export function useGetStaffService(profileMode = false) {
  const fetch = useFetch();
  return useCallback(
    (data: StaffListRequest, requestConfig?: RequestConfigType) => {
      // Global list endpoint; branchId opsional sebagai filter server-side.
      const url = new URL(`${API_URL}/v1/customer/${profileMode ? "me/staff" : "staff"}`);
      if (data.branchId != null) {
        url.searchParams.append("branchId", String(data.branchId));
      }
      if (data.customerId != null) {
        url.searchParams.append("customerId", String(data.customerId));
      }
      url.searchParams.append("page", String(data.page));
      url.searchParams.append("limit", String(data.limit));
      if (data.filters) {
        url.searchParams.append("filters", JSON.stringify(data.filters));
      }
      if (data.sort) {
        url.searchParams.append("sort", JSON.stringify(data.sort));
      }
      return fetch(url, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<StaffListResponse>,
      );
    },
    [fetch, profileMode],
  );
}

export type StaffGetRequest = { id: Staff["id"] };
export type StaffGetResponse = Staff;

export function useGetStaffByIdService(profileMode = false) {
  const fetch = useFetch();
  return useCallback(
    (data: StaffGetRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/${profileMode ? "me/staff" : "staff"}/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<StaffGetResponse>);
    },
    [fetch, profileMode],
  );
}

export type StaffPostRequest = {
  branchId: Staff["branchId"];
  name: string;
  /** Host user id — unik antar staff, API menolak `staffUserAlreadyLinked`. */
  userId?: number | null;
  position?: string | null;
  phone?: string | null;
  email?: string | null;
  nip?: string | null;
  addressLine?: string | null;
  provinceId?: number | null;
  cityId?: number | null;
  photoId?: string | null;
  isActive?: boolean;
};
export type StaffPostResponse = Staff;

export function useCreateStaffService() {
  const fetch = useFetch();
  return useCallback(
    (data: StaffPostRequest, requestConfig?: RequestConfigType) => {
      const { branchId, ...body } = data;
      return fetch(`${API_URL}/v1/customer/branches/${branchId}/staff`, {
        method: "POST",
        body: JSON.stringify(body),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<StaffPostResponse>);
    },
    [fetch],
  );
}

export type StaffPatchRequest = {
  id: Staff["id"];
  data: Partial<Omit<StaffPostRequest, "branchId">>;
};
export type StaffPatchResponse = Staff;

export function useUpdateStaffService(profileMode = false) {
  const fetch = useFetch();
  return useCallback(
    (data: StaffPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/${profileMode ? "me/staff" : "staff"}/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<StaffPatchResponse>);
    },
    [fetch, profileMode],
  );
}

export type StaffDeleteRequest = { id: Staff["id"] };
export type StaffDeleteResponse = undefined;

export function useDeleteStaffService() {
  const fetch = useFetch();
  return useCallback(
    (data: StaffDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/staff/${data.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<StaffDeleteResponse>);
    },
    [fetch],
  );
}
