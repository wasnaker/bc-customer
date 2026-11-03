import { MigrationInterface, QueryRunner } from 'typeorm';
/**
 * Create the bc-customer core tables: customer, branch, staff,
 * customer_document — sesuai kontrak final §7 (I1–I9 + J1–J3).
 *
 * Notes:
 * - Reversible: `down` drops only the tables created here. The legacy
 *   province/regency tables are NOT touched (they are owned by the region
 *   module in host databases).
 * - Cross-module FKs follow the OWNER table's id type: region `int`,
 *   host `user` `int`, host `file` `uuid`. Only intra-module relations
 *   (customerId, branchId) use bigint.
 * - `code` (char 6, Crockford Base32 dari id+salt) hanya di customer dan
 *   branch — staff tidak butuh code.
 * - branch.addressLine WAJIB untuk semua branch (J2).
 * - Maks 1 HO per customer: partial unique index.
 * - branch/staff region FK memakai ON DELETE RESTRICT.
 */
export declare class CreateCustomerCoreTables1793820000000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
