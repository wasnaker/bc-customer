import { Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { CUSTOMER_DEMO_DATA_SQL } from "./customer-demo-data.sql";

/**
 * Seeds the demo dataset (customers, branches, staff and their linked host
 * user accounts) with primary keys preserved exactly — including id gaps —
 * so a reseed always converges to the same record set and order.
 *
 * Idempotent: demo records are upserted and default Customer module-role
 * assignments are inserted only when no admin assignment exists for that
 * branch/customer scope. Host-owned users 1–2 are never touched; only demo
 * ids 3–46 shipped by this module. Runs in one host transaction.
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

      // Default module role for linked customer staff. Core roleId remains
      // the host's ordinary "user" role; module roles live in the host-owned
      // scoped assignment table.
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
          AND NOT EXISTS (
            SELECT 1
            FROM "module_role_assignment" assignment
            WHERE assignment."userId" = staff."userId"
              AND assignment."moduleId" = 'customer'
              AND (
                (
                  assignment."roleKey" = 'customer-admin'
                  AND assignment."scopeType" = 'customer'
                  AND assignment."scopeId" = branch."customerId"::varchar
                )
                OR
                (
                  assignment."roleKey" = 'branch-admin'
                  AND assignment."scopeType" = 'branch'
                  AND assignment."scopeId" = staff."branchId"::varchar
                )
              )
          )
        ON CONFLICT ("moduleId", "roleKey", "userId", "scopeType", "scopeId")
        DO NOTHING
      `);
    });
  }
}
