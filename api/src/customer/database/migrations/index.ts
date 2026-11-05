import { CreateCustomerCoreTables1793820000000000 } from './1793820000000000-CreateCustomerCoreTables';
import { AddCustomerCodeTriggers1793850000000000001 } from './1793850000000000001-AddCustomerCodeTriggers';
import { RenameBranchNitkuNumberToVatNumber1793860000000000001 } from './1793860000000000001-RenameBranchNitkuNumberToVatNumber';

export { CreateCustomerCoreTables1793820000000000 };
export { AddCustomerCodeTriggers1793850000000000001 };
export { RenameBranchNitkuNumberToVatNumber1793860000000000001 };

/**
 * Standard package contract consumed by the host's generated registry.
 *
 * This module owns ONLY its core tables (customer, branch, staff,
 * customer_document). The province/regency tables belong to the region
 * module — region is a hard dependency (`requires: ['region']`) and its
 * migrations create the tables these FKs point at.
 */
export const moduleMigrations = [
  CreateCustomerCoreTables1793820000000000,
  AddCustomerCodeTriggers1793850000000000001,
  RenameBranchNitkuNumberToVatNumber1793860000000000001,
] as const;
