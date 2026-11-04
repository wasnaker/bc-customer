import { Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { CUSTOMER_DEMO_DATA_SQL } from "./customer-demo-data.sql";

/**
 * Seeds the demo dataset (customers, branches, staff and their linked host
 * user accounts) with primary keys preserved exactly — including id gaps —
 * so a reseed always converges to the same record set and order.
 *
 * Idempotent: every statement is an upsert (`ON CONFLICT (id) DO UPDATE`).
 * Host-owned users 1–2 (admin@example.com, john.doe@example.com) are never
 * touched; only ids 3–46 shipped by this module. Runs inside a single
 * transaction via `npm run seed:run:relational` on the host.
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
    });
  }
}
