"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleDefinition = void 0;
const customer_module_1 = require("./customer.module");
const customer_manifest_1 = require("./customer.manifest");
const customer_entities_1 = require("./customer.entities");
const migrations_1 = require("./database/migrations");
const customer_seeds_1 = require("./customer.seeds");
/**
 * Standard backend module contract consumed by the host module runtime.
 * New modules should expose the same named export from their api/definition entry.
 */
exports.moduleDefinition = {
    manifest: customer_manifest_1.moduleManifest,
    registerAsync: (options) => customer_module_1.CustomerModule.registerAsync(options),
    entities: customer_entities_1.moduleEntities,
    migrations: migrations_1.moduleMigrations,
    seedServices: customer_seeds_1.moduleSeedServices,
};
