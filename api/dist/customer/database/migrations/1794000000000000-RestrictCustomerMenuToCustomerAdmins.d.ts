import { MigrationInterface, QueryRunner } from "typeorm";
/**
 * Customer staff and branch admins must not receive the customer-management
 * navigation permission. Only Customer Admin (and centrally granted Admin)
 * may access the Customer menu.
 */
export declare class RestrictCustomerMenuToCustomerAdmins1794000000000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(_queryRunner: QueryRunner): Promise<void>;
}
