import { CreateCustomerDocumentDto } from '../dto/create-customer-document.dto';
import { UpdateCustomerDocumentDto } from '../dto/update-customer-document.dto';
import { FilterCustomerDocumentDto, SortCustomerDocumentDto } from '../dto/query-customer-document.dto';
import { CustomerDocument } from '../domain/customer-document';
import { CustomerDocumentRepository } from '../infrastructure/persistence/customer-document.repository';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
export declare class CustomerDocumentService {
    private readonly customerDocumentRepository;
    constructor(customerDocumentRepository: CustomerDocumentRepository);
    create(createCustomerDocumentDto: CreateCustomerDocumentDto): Promise<CustomerDocument>;
    findManyByOwner({ ownerType, ownerId, filterOptions, sortOptions, paginationOptions, }: {
        ownerType: CustomerDocument['ownerType'];
        ownerId: CustomerDocument['ownerId'];
        filterOptions?: FilterCustomerDocumentDto | null;
        sortOptions?: SortCustomerDocumentDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<CustomerDocument[]>;
    countByOwner(ownerType: CustomerDocument['ownerType'], ownerId: CustomerDocument['ownerId'], filterOptions?: FilterCustomerDocumentDto | null): Promise<number>;
    findDocumentById(id: CustomerDocument['id']): Promise<NullableType<CustomerDocument>>;
    update(id: CustomerDocument['id'], updateCustomerDocumentDto: UpdateCustomerDocumentDto): Promise<CustomerDocument>;
    remove(id: CustomerDocument['id']): Promise<void>;
}
