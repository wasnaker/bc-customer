import {
  BranchEntity,
} from './infrastructure/persistence/relational/entities/branch.entity';
import {
  CustomerDocumentEntity,
} from './infrastructure/persistence/relational/entities/customer-document.entity';
import {
  CustomerEntity,
} from './infrastructure/persistence/relational/entities/customer.entity';
import {
  StaffEntity,
} from './infrastructure/persistence/relational/entities/staff.entity';

/** Entity metadata owned by this module; register with the host TypeORM DataSource. */
export const CUSTOMER_ENTITIES = [
  CustomerEntity,
  BranchEntity,
  StaffEntity,
  CustomerDocumentEntity,
] as const;

/** Standard package contract consumed by the host's generated registry. */
export const moduleEntities = CUSTOMER_ENTITIES;

export { CustomerEntity, BranchEntity, StaffEntity, CustomerDocumentEntity };
