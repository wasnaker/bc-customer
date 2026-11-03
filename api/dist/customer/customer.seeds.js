"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleSeedServices = void 0;
const customer_seed_service_1 = require("./database/customer-seed.service");
/** Seed providers owned by this module and executed by the host seed lifecycle. */
exports.moduleSeedServices = [customer_seed_service_1.CustomerSeedService];
