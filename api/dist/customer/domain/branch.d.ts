export declare class Branch {
    id: bigint | string;
    ulid: string | null;
    code: string | null;
    customerId: bigint | string;
    name: string;
    isHeadOffice: boolean;
    /**
     * Alamat lengkap — wajib untuk SEMUA branch (J2: bisa beda kota/provinsi).
     */
    addressLine: string;
    provinceId: number;
    cityId: number;
    postalCode: string | null;
    nitkuNumber: string | null;
    vatType: 'npwp' | 'nitku';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
