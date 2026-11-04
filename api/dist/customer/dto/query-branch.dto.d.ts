import { Branch } from "../domain/branch";
export declare class FilterBranchDto {
    name?: string;
    isHeadOffice?: boolean;
}
export declare class SortBranchDto {
    orderBy: keyof Branch;
    order: string;
}
export declare class QueryBranchDto {
    page?: number;
    limit?: number;
    /**
     * Filter opsional milik customer (global list `GET /customer/branches`).
     * Diabaikan pada route nested `GET /customer/:customerId/branches`.
     */
    customerId?: string;
    filters?: FilterBranchDto | null;
    sort?: SortBranchDto[] | null;
}
