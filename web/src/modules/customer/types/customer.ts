// Bigint PK datang sebagai string dari API (lihat entity `example: '1'`).
// Jangan pernah Number()-kan id customer/branch/staff — pakai String().

export type VatType = "npwp" | "nitku";

// ── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  ulid: string | null;
  /** 6-char Crockford Base32 human code. */
  code: string | null;
  name: string;
  /** Host user id (main account). */
  userId: number | null;
  npwpNumber: string | null;
  nibNumber: string | null;
  isActive: boolean;
  /** Head-office branch — diisi saat create (J1) dan pada beberapa respons. */
  headOffice?: Branch | null;
  createdAt: string;
  updatedAt: string;
}

// ── Branch ──────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  ulid: string | null;
  code: string | null;
  customerId: string;
  /** Nama customer induk — terisi pada list global, null bila tidak di-join. */
  customerName?: string | null;
  name: string;
  isHeadOffice: boolean;
  addressLine: string;
  /** Province id (int, milik modul region). */
  provinceId: number;
  /** Regency id (int, milik modul region). */
  cityId: number;
  postalCode: string | null;
  nitkuNumber: string | null;
  vatType: VatType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Staff ───────────────────────────────────────────────────────────────────

export interface Staff {
  id: string;
  ulid: string | null;
  branchId: string;
  name: string;
  /** Host user id — unik antar staff bila diisi. */
  userId: number | null;
  position: string | null;
  phone: string | null;
  email: string | null;
  nip: string | null;
  addressLine: string | null;
  provinceId: number | null;
  cityId: number | null;
  /** Host file id (uuid). */
  photoId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Customer document (polymorphic: customer / branch / staff) ──────────────

export type CustomerDocumentOwnerType = "customer" | "branch" | "staff";

export interface CustomerDocument {
  id: string;
  ulid: string | null;
  ownerType: CustomerDocumentOwnerType;
  ownerId: string;
  /** mis. 'nib' | 'npwp' | 'nitku' | 'legalitas' | … */
  type: string;
  number: string | null;
  /** Host file id (uuid) — file sebagai bukti dokumen. */
  fileId: string;
  issuedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Payloads ────────────────────────────────────────────────────────────────

/**
 * Respons list modul customer: `{ data, total, page, limit }` — TIDAK sama
 * dengan InfinityPaginationType host (yang tidak punya `total`).
 */
export interface CustomerPagination<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
}

/** Blok alamat kantor pusat — WAJIB saat create customer (kontrak J1). */
export interface HeadOfficeInput {
  name: string;
  addressLine: string;
  provinceId: number;
  cityId: number;
  postalCode?: string | null;
  nitkuNumber?: string | null;
  vatType?: VatType;
}
