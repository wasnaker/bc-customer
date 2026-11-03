import { Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterCustomerDto, SortCustomerDto } from '../../../../dto/query-customer.dto';
import { Customer } from '../../../../domain/customer';
import { CustomerRepository } from '../../customer.repository';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
export declare class CustomersRelationalRepository implements CustomerRepository {
    private readonly customerRepository;
    constructor(customerRepository: Repository<CustomerEntity>);
    create(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'ulid' | 'code'>): Promise<Customer>;
    findManyWithPagination({ filterOptions, sortOptions, paginationOptions, }: {
        filterOptions?: FilterCustomerDto | null;
        sortOptions?: SortCustomerDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Customer[]>;
    findById(id: Customer['id']): Promise<NullableType<Customer>>;
    findByName(name: string): Promise<NullableType<Customer>>;
    existsByName(name: string): Promise<boolean>;
    countWithFilter(filterOptions?: FilterCustomerDto | null): Promise<number>;
    update(id: Customer['id'], payload: Partial<Customer>): Promise<Customer | null>;
    remove(id: Customer['id']): Promise<void>;
}
