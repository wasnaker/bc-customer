import { CustomerDocument } from '../../../../domain/customer-document';
import { CustomerDocumentEntity } from '../entities/customer-document.entity';
export declare class CustomerDocumentMapper {
    static toDomain(raw: CustomerDocumentEntity): CustomerDocument;
    static toPersistence(domainEntity: Partial<CustomerDocument>): CustomerDocumentEntity;
}
