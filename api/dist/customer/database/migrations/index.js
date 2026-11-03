"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleMigrations = exports.AddCustomerCodeTriggers1793850000000000001 = exports.CreateCustomerCoreTables1793820000000000 = void 0;
const _1793820000000000_CreateCustomerCoreTables_1 = require("./1793820000000000-CreateCustomerCoreTables");
Object.defineProperty(exports, "CreateCustomerCoreTables1793820000000000", { enumerable: true, get: function () { return _1793820000000000_CreateCustomerCoreTables_1.CreateCustomerCoreTables1793820000000000; } });
const _1793850000000000001_AddCustomerCodeTriggers_1 = require("./1793850000000000001-AddCustomerCodeTriggers");
Object.defineProperty(exports, "AddCustomerCodeTriggers1793850000000000001", { enumerable: true, get: function () { return _1793850000000000001_AddCustomerCodeTriggers_1.AddCustomerCodeTriggers1793850000000000001; } });
/**
 * Standard package contract consumed by the host's generated registry.
 *
 * This module owns ONLY its core tables (customer, branch, staff,
 * customer_document). The province/regency tables belong to the region
 * module — region is a hard dependency (`requires: ['region']`) and its
 * migrations create the tables these FKs point at.
 */
exports.moduleMigrations = [
    _1793820000000000_CreateCustomerCoreTables_1.CreateCustomerCoreTables1793820000000000,
    _1793850000000000001_AddCustomerCodeTriggers_1.AddCustomerCodeTriggers1793850000000000001,
];
