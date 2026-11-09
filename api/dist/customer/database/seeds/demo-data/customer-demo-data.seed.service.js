"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CustomerDemoDataSeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDemoDataSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const customer_demo_data_sql_1 = require("./customer-demo-data.sql");
/**
 * Seeds the demo dataset (customers, branches, staff and their linked host
 * user accounts) with primary keys preserved exactly — including id gaps —
 * so a reseed always converges to the same record set and order.
 *
 * The current demo dataset has one appointed staff account per branch:
 * - every demo staff account receives Customer at its branch scope;
 * - every current branch staff account also receives Customer Branch Admin;
 * - the current head-office staff account also receives Customer Admin
 *   at its customer scope.
 *
 * The demo accounts also carry the same role set in the canonical
 * `user_roles_role` relation so the admin panel shows them consistently:
 * - Customer Admin (3)          -> Customer Admin + Customer Branch Admin + Customer
 * - Customer Branch Admin (4)   -> Customer Branch Admin + Customer
 * - Customer (5)                -> Customer
 *
 * This is demo-data appointment only. Staff created later receive Customer
 * only by default; administrative roles must be assigned explicitly.
 * Core user.roleId values are preserved by the SQL dataset.
 */
let CustomerDemoDataSeedService = CustomerDemoDataSeedService_1 = class CustomerDemoDataSeedService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(CustomerDemoDataSeedService_1.name);
    }
    async run() {
        this.logger.log("Running customer demo data seed...");
        await this.dataSource.transaction(async (manager) => {
            await manager.query(customer_demo_data_sql_1.CUSTOMER_DEMO_DATA_SQL);
            this.logger.log("Demo SQL executed, assigning roles...");
            // Initial demo appointments. Additional staff are not included in this
            // fixed demo seed and must receive admin roles only through an explicit
            // assignment action.
            // Keep existing scoped assignments compatible with the renamed manifest key.
            await manager.query(`
        UPDATE "module_role_assignment"
        SET "roleKey" = 'customer-branch-admin'
        WHERE "moduleId" = 'customer' AND "roleKey" = 'branch-admin'
      `);
            const result = await manager.query(`
        INSERT INTO "module_role_assignment"
          ("userId", "moduleId", "roleKey", "scopeType", "scopeId")
        SELECT
          staff."userId",
          'customer',
          'customer',
          'branch',
          staff."branchId"::varchar
        FROM "staff" staff
        INNER JOIN "branch" branch ON branch."id" = staff."branchId"
        WHERE staff."userId" IS NOT NULL
          AND staff."id" BETWEEN 3 AND 46

        UNION ALL

        SELECT
          staff."userId",
          'customer',
          'customer-branch-admin',
          'branch',
          staff."branchId"::varchar
        FROM "staff" staff
        INNER JOIN "branch" branch ON branch."id" = staff."branchId"
        WHERE staff."userId" IS NOT NULL
          AND staff."id" BETWEEN 3 AND 46

        UNION ALL

        SELECT
          staff."userId",
          'customer',
          'customer-admin',
          'customer',
          branch."customerId"::varchar
        FROM "staff" staff
        INNER JOIN "branch" branch ON branch."id" = staff."branchId"
        WHERE staff."userId" IS NOT NULL
          AND staff."id" BETWEEN 3 AND 46
          AND branch."isHeadOffice" = TRUE

        ON CONFLICT ("moduleId", "roleKey", "userId", "scopeType", "scopeId")
        DO NOTHING
      `);
            this.logger.log("Role assignments complete.");
            // Mirror the demo appointments into the canonical user_roles_role
            // relation so the admin panel lists the same role set that the scoped
            // module assignments imply. Additive and idempotent: manual edits made
            // through the admin panel are preserved, missing demo roles are restored.
            await manager.query(`
        INSERT INTO "user_roles_role" ("userId", "roleId")
        SELECT "id", 5
        FROM "user"
        WHERE "id" BETWEEN 3 AND 46
          AND "roleId" IN (3, 4, 5)
        ON CONFLICT ("userId", "roleId") DO NOTHING
      `);
            await manager.query(`
        INSERT INTO "user_roles_role" ("userId", "roleId")
        SELECT "id", 4
        FROM "user"
        WHERE "id" BETWEEN 3 AND 46
          AND "roleId" IN (3, 4)
        ON CONFLICT ("userId", "roleId") DO NOTHING
      `);
            await manager.query(`
        INSERT INTO "user_roles_role" ("userId", "roleId")
        SELECT "id", 3
        FROM "user"
        WHERE "id" BETWEEN 3 AND 46
          AND "roleId" = 3
        ON CONFLICT ("userId", "roleId") DO NOTHING
      `);
            this.logger.log("Canonical user roles synchronised.");
        });
    }
};
exports.CustomerDemoDataSeedService = CustomerDemoDataSeedService;
exports.CustomerDemoDataSeedService = CustomerDemoDataSeedService = CustomerDemoDataSeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(typeorm_1.DataSource)),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], CustomerDemoDataSeedService);
