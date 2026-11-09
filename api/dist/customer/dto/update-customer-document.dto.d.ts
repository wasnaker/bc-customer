import { CustomerDocumentOwnerTypeEnum } from '../domain/customer-document';
import { CreateCustomerDocumentDto } from './create-customer-document.dto';
declare const UpdateCustomerDocumentDto_base: import("@nestjs/common").Type<Partial<CreateCustomerDocumentDto>>;
export declare class UpdateCustomerDocumentDto extends UpdateCustomerDocumentDto_base {
    ownerType?: CustomerDocumentOwnerTypeEnum;
    ownerId?: string;
    type?: string;
    number?: string | null;
    fileId?: string;
    isActive?: boolean;
}
export {};
