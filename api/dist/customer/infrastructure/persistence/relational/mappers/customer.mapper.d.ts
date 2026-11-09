import { Customer } from '../../../../domain/customer';
import { CustomerEntity } from '../entities/customer.entity';
export declare class CustomerMapper {
    static toDomain(raw: CustomerEntity): Customer;
    static toPersistence(domainEntity: Partial<Customer>): CustomerEntity;
}
