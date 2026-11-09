"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestrictCustomerMenuToCustomerAdmins1794000000000000 = void 0;
/**
 * Customer staff and branch admins must not receive the customer-management
 * navigation permission. Only Customer Admin (and centrally granted Admin)
 * may access the Customer menu.
 */
class RestrictCustomerMenuToCustomerAdmins1794000000000000 {
    constructor() {
        this.name = "RestrictCustomerMenuToCustomerAdmins1794000000000000";
    }
    async up(queryRunner) {
        await queryRunner.query(`
      DELETE FROM "roles_permissions_role" rp
      USING "role" r, "permission" p
      WHERE rp."roleId" = r."id"
        AND rp."permissionId" = p."id"
        AND r."name" IN ('Customer', 'Customer Branch Admin')
        AND p."name" = 'read:customer'
    `);
    }
    async down(_queryRunner) {
        // Intentionally do not restore broad menu access to customer staff roles.
    }
}
exports.RestrictCustomerMenuToCustomerAdmins1794000000000000 = RestrictCustomerMenuToCustomerAdmins1794000000000000;
