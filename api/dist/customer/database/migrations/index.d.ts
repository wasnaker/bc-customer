import { CreateCustomer1793466257948612617 } from './1793466257948612617-CreateCustomer';
import { AddCustomerUniquenessConstraints1793466257948612618 } from './1793466257948612618-AddCustomerUniquenessConstraints';
import { AddRegencyCode1793710213000000000 } from './1793710213000000000-AddRegencyCode';
import { CreateCustomerCoreTables1793820000000000 } from './1793820000000000-CreateCustomerCoreTables';
export { CreateCustomer1793466257948612617 };
export { AddCustomerUniquenessConstraints1793466257948612618 };
export { AddRegencyCode1793710213000000000 };
export { CreateCustomerCoreTables1793820000000000 };
/**
 * Standard package contract consumed by the host's generated registry.
 *
 * The two legacy province/regency migrations are kept for hosts that already
 * ran them (they are idempotent and the tables themselves belong to the
 * region module). The core tables migration creates this module's own schema.
 */
export declare const moduleMigrations: readonly [typeof CreateCustomer1793466257948612617, typeof AddCustomerUniquenessConstraints1793466257948612618, typeof AddRegencyCode1793710213000000000, typeof CreateCustomerCoreTables1793820000000000];
