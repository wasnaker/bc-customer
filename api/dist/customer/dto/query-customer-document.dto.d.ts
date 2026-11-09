import { CustomerDocument, CustomerDocumentOwnerTypeEnum } from '../domain/customer-document';
export declare class QueryCustomerDocumentDto {
    /** Polymorphic owner discriminator — required for the list endpoint. */
    ownerType: CustomerDocumentOwnerTypeEnum;
    /** Owner id (bigint serialized as string). */
    ownerId: string;
    page?: number;
    limit?: number;
    filters?: FilterCustomerDocumentDto | null;
    sort?: SortCustomerDocumentDto[] | null;
}
export declare class FilterCustomerDocumentDto {
    type?: string;
}
export declare class SortCustomerDocumentDto {
    orderBy: keyof CustomerDocument;
    order: string;
}
