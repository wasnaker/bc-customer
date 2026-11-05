import { Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { CUSTOMER_DEMO_DATA_SQL } from "./customer-demo-data.sql";

/**
 * Seeds the demo dataset (customers, branches, staff and their linked host
 * user accounts) with primary keys preserved exactly — including id gaps —
 * so a reseed always converges to the same record set and order.
 *
 * The current demo dataset has one appointed staff account per branch:
 * - every demo staff account receives Customer at its branch scope;
 * - every current branch staff account also receives Branch Admin;
 * - the current head-office staff account also receives Customer Admin
 *   at its customer scope.
 *
 * This is demo-data appointment only. Staff created later receive Customer
 * only by default; administrative roles must be assigned explicitly.
 * Core user.roleId values are preserved by the SQL dataset.
 */
@Injectable()
export class CustomerDemoDataSeedService {
  constructor(
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  async run(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query(CUSTOMER_DEMO_DATA_SQL);

      // Initial demo appointments. Additional staff are not included in this
      // fixed demo seed and must receive admin roles only through an explicit
      // assignment action.
      await manager.query(`
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

        UNION ALL

        SELECT
          staff."userId",
          'customer',
          'branch-admin',
          'branch',
          staff."branchId"::varchar
        FROM "staff" staff
        INNER JOIN "branch" branch ON branch."id" = staff."branchId"
        WHERE staff."userId" IS NOT NULL

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
          AND branch."isHeadOffice" = TRUE

        ON CONFLICT ("moduleId", "roleKey", "userId", "scopeType", "scopeId")
        DO NOTHING
      `);
    });
  }
}
