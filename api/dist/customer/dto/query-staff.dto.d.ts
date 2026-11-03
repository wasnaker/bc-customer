import { Staff } from '../domain/staff';
export declare class FilterStaffDto {
    name?: string;
    position?: string;
}
export declare class SortStaffDto {
    orderBy: keyof Staff;
    order: string;
}
export declare class QueryStaffDto {
    page?: number;
    limit?: number;
    filters?: FilterStaffDto | null;
    sort?: SortStaffDto[] | null;
}
