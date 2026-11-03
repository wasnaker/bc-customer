import { CustomerDocumentOwnerTypeEnum } from '../domain/customer-document';
export declare class CreateCustomerDocumentDto {
    ownerType: CustomerDocumentOwnerTypeEnum;
    ownerId: string;
    type: string;
    number?: string | null;
    fileId: string;
    issuedAt?: Date | string | null;
    expiresAt?: Date | string | null;
    isActive?: boolean;
}
