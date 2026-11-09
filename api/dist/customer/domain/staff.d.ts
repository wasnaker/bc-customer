export declare class Staff {
    id: bigint | string;
    ulid: string | null;
    branchId: bigint | string;
    /** Nama branch induk — terisi pada list global (join), opsional. */
    branchName?: string | null;
    /** Nama customer atas branch — terisi pada list global (join), opsional. */
    customerName?: string | null;
    /** Owning customer id, included in scoped global/profile staff lists. */
    customerId?: bigint | string | null;
    name: string;
    userId: number | null;
    position: string | null;
    phone: string | null;
    email: string | null;
    nip: string | null;
    addressLine: string | null;
    provinceId: number | null;
    cityId: number | null;
    photoId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
