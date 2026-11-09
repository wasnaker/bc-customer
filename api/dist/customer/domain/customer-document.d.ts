export declare enum CustomerDocumentOwnerTypeEnum {
    CUSTOMER = "customer",
    BRANCH = "branch",
    STAFF = "staff"
}
export declare const CUSTOMER_DOCUMENT_OWNER_TYPES: CustomerDocumentOwnerTypeEnum[];
export declare class CustomerDocument {
    id: bigint | string;
    ulid: string | null;
    ownerType: CustomerDocumentOwnerTypeEnum;
    ownerId: bigint | string;
    type: string;
    number: string | null;
    fileId: string;
    issuedAt: Date | string | null;
    expiresAt: Date | string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
