/**
 * Seed providers owned by this module and executed by the host seed lifecycle
 * (`npm run seed:run:relational`).
 *
 * `CustomerDemoDataSeedService` restores the demo dataset — customers,
 * branches, staff and linked user accounts — with ids preserved exactly
 * (upsert by pk, idempotent). See `database/seeds/demo-data/`.
 */
import { CustomerDemoDataSeedService } from "./database/seeds/demo-data/customer-demo-data.seed.service";
export declare const moduleSeedServices: readonly [typeof CustomerDemoDataSeedService];
