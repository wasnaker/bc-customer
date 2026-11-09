import { Staff } from "../domain/staff";
export declare class FilterStaffDto {
    name?: string;
    position?: string;
}
export declare class SortStaffDto {
    orderBy: keyof Staff;
    order: string;
}
export declare class QueryStaffDto {
    /**
     * Filter opsional milik branch (global list `GET /customer/staff`).
     * Diabaikan pada route nested `GET /customer/branches/:branchId/staff`.
     */
    branchId?: string;
    /**
     * Filter opsional milik customer (via branch) — untuk mode "customer
     * dipilih, cabang belum". Diabaikan pada route nested.
     */
    customerId?: string;
    page?: number;
    limit?: number;
    filters?: FilterStaffDto | null;
    sort?: SortStaffDto[] | null;
}
