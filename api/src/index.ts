export { CustomerModule, CUSTOMER_MODULE_OPTIONS } from './customer/customer.module';
export type { CustomerModuleOptions, CustomerModuleAsyncOptions } from './customer/customer.options';

export { CustomerAccessGuard } from './customer/security/customer-access.guard';
export { CustomerResource, CUSTOMER_RESOURCE_METADATA } from './customer/security/customer-resource.decorator';
export { CustomerEntity, BranchEntity, StaffEntity, CustomerDocumentEntity } from './customer/customer.entities';
export { CUSTOMER_ENTITIES } from './customer/customer.entities';

export { Customer } from './customer/domain/customer';
export { Branch } from './customer/domain/branch';
export { Staff } from './customer/domain/staff';
export {
  CustomerDocument,
  CustomerDocumentOwnerTypeEnum,
} from './customer/domain/customer-document';

export { CustomerService } from './customer/services/customer.service';
export { BranchService } from './customer/services/branch.service';
export { StaffService } from './customer/services/staff.service';
export { CustomerDocumentService } from './customer/services/customer-document.service';
export { RegionValidationService } from './customer/services/region-validation.service';

export { CustomerController } from './customer/controllers/customer.controller';

export { CustomerRepository } from './customer/infrastructure/persistence/customer.repository';
export { BranchRepository } from './customer/infrastructure/persistence/branch.repository';
export { StaffRepository } from './customer/infrastructure/persistence/staff.repository';
export { CustomerDocumentRepository } from './customer/infrastructure/persistence/customer-document.repository';
