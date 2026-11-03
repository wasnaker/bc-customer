import { CreateCustomerCoreTables1793820000000000 } from './1793820000000000-CreateCustomerCoreTables';
export { CreateCustomerCoreTables1793820000000000 };
/**
 * Standard package contract consumed by the host's generated registry.
 *
 * This module owns ONLY its core tables (customer, branch, staff,
 * customer_document). The province/regency tables belong to the region
 * module — region is a hard dependency (`requires: ['region']`) and its
 * migrations create the tables these FKs point at.
 */
export declare const moduleMigrations: readonly [typeof CreateCustomerCoreTables1793820000000000];
