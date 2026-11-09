"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleSeedServices = void 0;
/**
 * Seed providers owned by this module and executed by the host seed lifecycle
 * (`npm run seed:run:relational`).
 *
 * `CustomerDemoDataSeedService` restores the demo dataset — customers,
 * branches, staff and linked user accounts — with ids preserved exactly
 * (upsert by pk, idempotent). See `database/seeds/demo-data/`.
 */
const customer_demo_data_seed_service_1 = require("./database/seeds/demo-data/customer-demo-data.seed.service");
exports.moduleSeedServices = [customer_demo_data_seed_service_1.CustomerDemoDataSeedService];
