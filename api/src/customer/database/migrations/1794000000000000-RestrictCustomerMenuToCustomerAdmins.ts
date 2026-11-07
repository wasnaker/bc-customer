import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Customer staff and branch admins must not receive the customer-management
 * navigation permission. Only Customer Admin (and centrally granted Admin)
 * may access the Customer menu.
 */
export class RestrictCustomerMenuToCustomerAdmins1794000000000000 implements MigrationInterface {
  name = "RestrictCustomerMenuToCustomerAdmins1794000000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "roles_permissions_role" rp
      USING "role" r, "permission" p
      WHERE rp."roleId" = r."id"
        AND rp."permissionId" = p."id"
        AND r."name" IN ('Customer', 'Customer Branch Admin')
        AND p."name" = 'read:customer'
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally do not restore broad menu access to customer staff roles.
  }
}
