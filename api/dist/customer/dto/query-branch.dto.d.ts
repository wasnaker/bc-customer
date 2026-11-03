import { Branch } from '../domain/branch';
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
    filters?: FilterBranchDto | null;
    sort?: SortBranchDto[] | null;
}
