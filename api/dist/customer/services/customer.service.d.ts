import { DataSource } from 'typeorm';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { FilterCustomerDto, SortCustomerDto } from '../dto/query-customer.dto';
import { Customer } from '../domain/customer';
import { Branch } from '../domain/branch';
import { CustomerRepository } from '../infrastructure/persistence/customer.repository';
import { BranchRepository } from '../infrastructure/persistence/branch.repository';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { RegionValidationService } from './region-validation.service';
export declare class CustomerService {
    private readonly customerRepository;
    private readonly branchRepository;
    private readonly regionValidation;
    private readonly dataSource;
    constructor(customerRepository: CustomerRepository, branchRepository: BranchRepository, regionValidation: RegionValidationService, dataSource: DataSource);
    create(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    findManyWithPagination({ filterOptions, sortOptions, paginationOptions, }: {
        filterOptions?: FilterCustomerDto | null;
        sortOptions?: SortCustomerDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Customer[]>;
    countWithFilter(filterOptions?: FilterCustomerDto | null): Promise<number>;
    findCustomerById(id: Customer['id']): Promise<NullableType<Customer>>;
    findHeadOffice(customerId: Customer['id']): Promise<NullableType<Branch>>;
    update(id: Customer['id'], updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    remove(id: Customer['id']): Promise<void>;
}
