import { BranchEntity } from './infrastructure/persistence/relational/entities/branch.entity';
import { CustomerDocumentEntity } from './infrastructure/persistence/relational/entities/customer-document.entity';
import { CustomerEntity } from './infrastructure/persistence/relational/entities/customer.entity';
import { StaffEntity } from './infrastructure/persistence/relational/entities/staff.entity';
/** Entity metadata owned by this module; register with the host TypeORM DataSource. */
export declare const CUSTOMER_ENTITIES: readonly [typeof CustomerEntity, typeof BranchEntity, typeof StaffEntity, typeof CustomerDocumentEntity];
/** Standard package contract consumed by the host's generated registry. */
export declare const moduleEntities: readonly [typeof CustomerEntity, typeof BranchEntity, typeof StaffEntity, typeof CustomerDocumentEntity];
export { CustomerEntity, BranchEntity, StaffEntity, CustomerDocumentEntity };
