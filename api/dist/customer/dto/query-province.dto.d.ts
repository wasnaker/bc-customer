import { Province } from '../domain/province';
export declare class FilterProvinceDto {
    search?: string;
}
export declare class SortProvinceDto {
    orderBy: keyof Province;
    order: string;
}
export declare class QueryProvinceDto {
    page?: number;
    limit?: number;
    filters?: FilterProvinceDto | null;
    sort?: SortProvinceDto[] | null;
}
