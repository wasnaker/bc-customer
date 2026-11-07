import { useCallback } from "react";
import useFetch from "@/services/api/use-fetch";
import { API_URL } from "@/services/api/config";
import wrapperFetchJsonResponse from "@/services/api/wrapper-fetch-json-response";
import type { SortEnum } from "@/services/api/types/sort-type";
import type { RequestConfigType } from "@/services/api/services/types/request-config";
import type { Branch, CustomerPagination, VatType } from "../types/customer";

// ── Branch (nested di bawah customer) ───────────────────────────────────────

export type BranchListRequest = {
  /** Opsional — bila kosong, list global (semua branch lintas customer). */
  customerId?: Branch["customerId"] | null;
  page: number;
  limit: number;
  /** Filter API: `name` (ILike) & `isHeadOffice`. Search dipetakan ke `name`. */
  filters?: Record<string, string | number | boolean>;
  sort?: Array<{ orderBy: keyof Branch; order: SortEnum }>;
};

export type BranchListResponse = CustomerPagination<Branch>;

export function useGetBranchesService() {
  const fetch = useFetch();
  return useCallback(
    (data: BranchListRequest, requestConfig?: RequestConfigType) => {
      // Global list endpoint; customerId opsional sebagai filter server-side.
      const url = new URL(`${API_URL}/v1/customer/branches`);
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
        wrapperFetchJsonResponse<BranchListResponse>,
      );
    },
    [fetch],
  );
}

export type BranchGetRequest = { id: Branch["id"] };
export type BranchGetResponse = Branch;

export function useGetBranchService() {
  const fetch = useFetch();
  return useCallback(
    (data: BranchGetRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/branches/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<BranchGetResponse>);
    },
    [fetch],
  );
}

export type BranchPostRequest = {
  customerId: Branch["customerId"];
  name: string;
  /** Max 1 kantor pusat per customer — API menolak dengan
   *  `customerAlreadyHasHeadOffice` bila sudah ada. */
  isHeadOffice?: boolean;
  addressLine: string;
  provinceId: number;
  cityId: number;
  postalCode?: string | null;
  vatNumber?: string | null;
  vatType?: VatType;
  isActive?: boolean;
};
export type BranchPostResponse = Branch;

export function useCreateBranchService() {
  const fetch = useFetch();
  return useCallback(
    (
      data: BranchPostRequest & { customerId: Branch["customerId"] },
      requestConfig?: RequestConfigType,
    ) => {
      const { customerId, ...body } = data;
      return fetch(`${API_URL}/v1/customer/${customerId}/branches`, {
        method: "POST",
        body: JSON.stringify(body),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<BranchPostResponse>);
    },
    [fetch],
  );
}

export type BranchPatchRequest = {
  id: Branch["id"];
  data: Partial<
    Omit<BranchPostRequest, "customerId" | "isHeadOffice"> & {
      isHeadOffice?: boolean;
    }
  >;
};
export type BranchPatchResponse = Branch;

export function useUpdateBranchService() {
  const fetch = useFetch();
  return useCallback(
    (data: BranchPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/branches/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<BranchPatchResponse>);
    },
    [fetch],
  );
}

export type BranchDeleteRequest = { id: Branch["id"] };
export type BranchDeleteResponse = undefined;

export function useDeleteBranchService() {
  const fetch = useFetch();
  return useCallback(
    (data: BranchDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/branches/${data.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<BranchDeleteResponse>);
    },
    [fetch],
  );
}


export type MyBranchResponse = Branch & {
  staffName: string;
  staffPosition: string | null;
};

/** Read only the branch linked to the currently authenticated account. */
export function useGetMyBranchService() {
  const fetch = useFetch();
  return useCallback(
    () =>
      fetch(`${API_URL}/v1/customer/me/branch`, {
        method: "GET",
      }).then(wrapperFetchJsonResponse<MyBranchResponse>),
    [fetch],
  );
}
