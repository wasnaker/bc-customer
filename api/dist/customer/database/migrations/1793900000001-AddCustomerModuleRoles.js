"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCustomerModuleRoles1793900000001 = void 0;
class AddCustomerModuleRoles1793900000001 {
    constructor() {
        this.name = "AddCustomerModuleRoles1793900000001";
    }
    async up(queryRunner) {
        // Insert roles 3, 4, 5 if they don't exist. 
        // We use explicit IDs to match the upcoming SQL seeder update.
        await queryRunner.query(`
      INSERT INTO "role" ("id", "name") 
      VALUES 
        (3, 'Customer Admin'),
        (4, 'Customer Branch Admin'),
        (5, 'Customer')
      ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name"
    `);
        // Role table has no sequence (manually seeded), skip setval
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "role" WHERE "id" IN (3, 4, 5)`);
    }
}
exports.AddCustomerModuleRoles1793900000001 = AddCustomerModuleRoles1793900000001;
