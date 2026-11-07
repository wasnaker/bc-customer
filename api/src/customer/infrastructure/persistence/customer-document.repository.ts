import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { CustomerDocument } from '../../domain/customer-document';

import {
  FilterCustomerDocumentDto,
  SortCustomerDocumentDto,
} from '../../dto/query-customer-document.dto';

export abstract class CustomerDocumentRepository {
  abstract create(
    data: Omit<CustomerDocument,
      'id' | 'createdAt' | 'updatedAt' | 'ulid'>,
  ): Promise<CustomerDocument>;

  abstract findManyByOwner({
    ownerType,
    ownerId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    ownerType: CustomerDocument['ownerType'];
    ownerId: CustomerDocument['ownerId'];
    filterOptions?: FilterCustomerDocumentDto | null;
    sortOptions?: SortCustomerDocumentDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<CustomerDocument[]>;

  abstract findById(
    id: CustomerDocument['id'],
  ): Promise<NullableType<CustomerDocument>>;

  abstract countByOwner(
    ownerType: CustomerDocument['ownerType'],
    ownerId: CustomerDocument['ownerId'],
    filterOptions?: FilterCustomerDocumentDto | null,
  ): Promise<number>;

  abstract update(
    id: CustomerDocument['id'],
    payload: DeepPartial<CustomerDocument>,
  ): Promise<CustomerDocument | null>;

  abstract remove(id: CustomerDocument['id']): Promise<void>;
}
