import { Regency, RegencyTypeEnum } from '../domain/regency';
export declare class FilterRegencyDto {
    provinceId?: Regency['provinceId'];
    type?: RegencyTypeEnum;
}
export declare class SortRegencyDto {
    orderBy: keyof Regency;
    order: string;
}
export declare class QueryRegencyDto {
    page?: number;
    limit?: number;
    provinceId?: Regency['provinceId'];
    filters?: FilterRegencyDto | null;
    sort?: SortRegencyDto[] | null;
}
