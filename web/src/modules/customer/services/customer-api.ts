import { useCallback } from "react";
import useFetch from "@/services/api/use-fetch";
import { API_URL } from "@/services/api/config";
import wrapperFetchJsonResponse from "@/services/api/wrapper-fetch-json-response";
import type { SortEnum } from "@/services/api/types/sort-type";
import type { RequestConfigType } from "@/services/api/services/types/request-config";
import type {
  Customer,
  CustomerDocument,
  CustomerDocumentOwnerType,
  CustomerPagination,
  HeadOfficeInput,
} from "../types/customer";

// ── Customer ────────────────────────────────────────────────────────────────

export type CustomerListRequest = {
  page: number;
  limit: number;
  /** Filter API: `name` (ILike) & `isActive`. Search dipetakan ke `name`. */
  filters?: Record<string, string | number | boolean>;
  sort?: Array<{ orderBy: keyof Customer; order: SortEnum }>;
};

export type CustomerListResponse = CustomerPagination<Customer>;

export function useGetCustomersService() {
  const fetch = useFetch();
  return useCallback(
    (data: CustomerListRequest, requestConfig?: RequestConfigType) => {
      const url = new URL(`${API_URL}/v1/customer`);
      url.searchParams.append("page", String(data.page));
      url.searchParams.append("limit", String(data.limit));
      if (data.filters) {
        url.searchParams.append("filters", JSON.stringify(data.filters));
      }
      if (data.sort) {
        url.searchParams.append("sort", JSON.stringify(data.sort));
      }
      return fetch(url, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<CustomerListResponse>,
      );
    },
    [fetch],
  );
}

export type CustomerGetRequest = { id: Customer["id"] };
export type CustomerGetResponse = Customer;

export function useGetCustomerService() {
  const fetch = useFetch();
  return useCallback(
    (data: CustomerGetRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomerGetResponse>);
    },
    [fetch],
  );
}

export type CustomerPostRequest = {
  name: string;
  npwpNumber?: string | null;
  nibNumber?: string | null;
  isActive?: boolean;
  /** Kontrak J1: membuat customer SELALU membuat kantor pusatnya (satu transaksi). */
  headOffice: HeadOfficeInput;
};
export type CustomerPostResponse = Customer;

export function useCreateCustomerService() {
  const fetch = useFetch();
  return useCallback(
    (data: CustomerPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomerPostResponse>);
    },
    [fetch],
  );
}

export type CustomerPatchRequest = {
  id: Customer["id"];
  /** Head office TIDAK diupdate di sini — pakai endpoint branch. */
  data: Partial<
    Pick<Customer, "name" | "npwpNumber" | "nibNumber" | "isActive">
  >;
};
export type CustomerPatchResponse = Customer;

export function useUpdateCustomerService() {
  const fetch = useFetch();
  return useCallback(
    (data: CustomerPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomerPatchResponse>);
    },
    [fetch],
  );
}

export type CustomerDeleteRequest = { id: Customer["id"] };
export type CustomerDeleteResponse = undefined;

export function useDeleteCustomerService() {
  const fetch = useFetch();
  return useCallback(
    (data: CustomerDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/${data.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomerDeleteResponse>);
    },
    [fetch],
  );
}

// ── Documents (polymorphic: ownerType = customer | branch | staff) ──────────

export type CustomerDocumentListRequest = {
  page: number;
  limit: number;
  ownerType: CustomerDocumentOwnerType;
  ownerId: CustomerDocument["ownerId"];
  filters?: Record<string, string | number | boolean>;
  sort?: Array<{ orderBy: keyof CustomerDocument; order: SortEnum }>;
};

export type CustomerDocumentListResponse = CustomerPagination<CustomerDocument>;

export function useGetCustomerDocumentsService() {
  const fetch = useFetch();
  return useCallback(
    (data: CustomerDocumentListRequest, requestConfig?: RequestConfigType) => {
      const url = new URL(`${API_URL}/v1/customer/documents`);
      url.searchParams.append("page", String(data.page));
      url.searchParams.append("limit", String(data.limit));
      url.searchParams.append("ownerType", data.ownerType);
      url.searchParams.append("ownerId", String(data.ownerId));
      if (data.filters) {
        url.searchParams.append("filters", JSON.stringify(data.filters));
      }
      if (data.sort) {
        url.searchParams.append("sort", JSON.stringify(data.sort));
      }
      return fetch(url, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<CustomerDocumentListResponse>,
      );
    },
    [fetch],
  );
}

export type CustomerDocumentPostRequest = {
  ownerType: CustomerDocumentOwnerType;
  ownerId: CustomerDocument["ownerId"];
  type: string;
  number?: string | null;
  fileId: string;
  issuedAt?: string | null;
  expiresAt?: string | null;
};
export type CustomerDocumentPostResponse = CustomerDocument;

export function useCreateCustomerDocumentService() {
  const fetch = useFetch();
  return useCallback(
    (data: CustomerDocumentPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/documents`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomerDocumentPostResponse>);
    },
    [fetch],
  );
}

export type CustomerDocumentPatchRequest = {
  id: CustomerDocument["id"];
  data: Partial<Omit<CustomerDocumentPostRequest, "ownerType" | "ownerId">>;
};
export type CustomerDocumentPatchResponse = CustomerDocument;

export function useUpdateCustomerDocumentService() {
  const fetch = useFetch();
  return useCallback(
    (data: CustomerDocumentPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customer/documents/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomerDocumentPatchResponse>);
    },
    [fetch],
  );
}

export type CustomerDocumentDeleteRequest = { id: CustomerDocument["id"] };
export type CustomerDocumentDeleteResponse = undefined;

export function useDeleteCustomerDocumentService() {
  const fetch = useFetch();
  return useCallback(
    (
      data: CustomerDocumentDeleteRequest,
      requestConfig?: RequestConfigType,
    ) => {
      return fetch(`${API_URL}/v1/customer/documents/${data.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomerDocumentDeleteResponse>);
    },
    [fetch],
  );
}
