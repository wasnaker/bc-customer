import { Repository } from 'typeorm';
import { CustomerDocumentEntity } from '../entities/customer-document.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterCustomerDocumentDto, SortCustomerDocumentDto } from '../../../../dto/query-customer-document.dto';
import { CustomerDocument } from '../../../../domain/customer-document';
import { CustomerDocumentRepository } from '../../customer-document.repository';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
export declare class CustomerDocumentsRelationalRepository implements CustomerDocumentRepository {
    private readonly customerDocumentRepository;
    constructor(customerDocumentRepository: Repository<CustomerDocumentEntity>);
    create(data: Omit<CustomerDocument, 'id' | 'createdAt' | 'updatedAt' | 'ulid'>): Promise<CustomerDocument>;
    findManyByOwner({ ownerType, ownerId, filterOptions, sortOptions, paginationOptions, }: {
        ownerType: CustomerDocument['ownerType'];
        ownerId: CustomerDocument['ownerId'];
        filterOptions?: FilterCustomerDocumentDto | null;
        sortOptions?: SortCustomerDocumentDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<CustomerDocument[]>;
    findById(id: CustomerDocument['id']): Promise<NullableType<CustomerDocument>>;
    countByOwner(ownerType: CustomerDocument['ownerType'], ownerId: CustomerDocument['ownerId'], filterOptions?: FilterCustomerDocumentDto | null): Promise<number>;
    update(id: CustomerDocument['id'], payload: Partial<CustomerDocument>): Promise<CustomerDocument | null>;
    remove(id: CustomerDocument['id']): Promise<void>;
}
