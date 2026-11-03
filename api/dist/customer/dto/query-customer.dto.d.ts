import { Customer } from '../domain/customer';
export declare class FilterCustomerDto {
    name?: string;
    isActive?: boolean;
}
export declare class SortCustomerDto {
    orderBy: keyof Customer;
    order: string;
}
export declare class QueryCustomerDto {
    page?: number;
    limit?: number;
    filters?: FilterCustomerDto | null;
    sort?: SortCustomerDto[] | null;
}
