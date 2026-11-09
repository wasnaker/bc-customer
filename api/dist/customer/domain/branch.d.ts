export declare class Branch {
    id: bigint | string;
    ulid: string | null;
    code: string | null;
    customerId: bigint | string;
    /** Nama customer induk — terisi pada list global (join), opsional. */
    customerName?: string | null;
    /**
     * Nama staff ter-link akun user (admin cabang) — terisi pada list global
     * (join staffs), opsional.
     */
    adminName?: string | null;
    name: string;
    isHeadOffice: boolean;
    /**
     * Alamat lengkap — wajib untuk SEMUA branch (J2: bisa beda kota/provinsi).
     */
    addressLine: string;
    provinceId: number;
    cityId: number;
    postalCode: string | null;
    vatNumber: string | null;
    vatType: "npwp" | "nitku";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
