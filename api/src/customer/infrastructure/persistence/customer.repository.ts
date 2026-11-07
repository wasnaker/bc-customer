import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Customer } from '../../domain/customer';

import { FilterCustomerDto, SortCustomerDto } from '../../dto/query-customer.dto';

export abstract class CustomerRepository {
  abstract create(
    data: Omit<Customer,
      'id' | 'createdAt' | 'updatedAt' | 'ulid' | 'code'>,
  ): Promise<Customer>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    scope,
  }: {
    scope?: { global: boolean; customerIds: readonly string[] };
    filterOptions?: FilterCustomerDto | null;
    sortOptions?: SortCustomerDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Customer[]>;

  abstract findById(id: Customer['id']): Promise<NullableType<Customer>>;

  abstract findByName(name: string): Promise<NullableType<Customer>>;

  abstract existsByName(name: string): Promise<boolean>;

  abstract countWithFilter(
    filterOptions?: FilterCustomerDto | null,
    scope?: { global: boolean; customerIds: readonly string[] },
  ): Promise<number>;

  abstract update(
    id: Customer['id'],
    payload: DeepPartial<Customer>,
  ): Promise<Customer | null>;

  abstract remove(id: Customer['id']): Promise<void>;
}
