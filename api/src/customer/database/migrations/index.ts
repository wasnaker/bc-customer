import { CreateCustomer1793466257948612617 } from './1793466257948612617-CreateCustomer';
import { AddCustomerUniquenessConstraints1793466257948612618 } from './1793466257948612618-AddCustomerUniquenessConstraints';
import { AddRegencyCode1793710213000000000 } from './1793710213000000000-AddRegencyCode';

export { CreateCustomer1793466257948612617 };
export { AddCustomerUniquenessConstraints1793466257948612618 };
export { AddRegencyCode1793710213000000000 };

/** Standard package contract consumed by the host's generated registry. */
export const moduleMigrations = [
  CreateCustomer1793466257948612617,
  AddCustomerUniquenessConstraints1793466257948612618,
  AddRegencyCode1793710213000000000,
] as const;
