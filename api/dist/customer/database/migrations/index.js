"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleMigrations = exports.RestrictCustomerMenuToCustomerAdmins1794000000000000 = exports.AddCustomerModuleRoles1793900000001 = exports.RenameBranchNitkuNumberToVatNumber1793860000001 = exports.AddCustomerCodeTriggers1793850000000 = exports.CreateCustomerCoreTables1793820000000 = void 0;
const _1793820000000000_CreateCustomerCoreTables_1 = require("./1793820000000000-CreateCustomerCoreTables");
Object.defineProperty(exports, "CreateCustomerCoreTables1793820000000", { enumerable: true, get: function () { return _1793820000000000_CreateCustomerCoreTables_1.CreateCustomerCoreTables1793820000000; } });
const _1793850000000000001_AddCustomerCodeTriggers_1 = require("./1793850000000000001-AddCustomerCodeTriggers");
Object.defineProperty(exports, "AddCustomerCodeTriggers1793850000000", { enumerable: true, get: function () { return _1793850000000000001_AddCustomerCodeTriggers_1.AddCustomerCodeTriggers1793850000000; } });
const _1793860000000000001_RenameBranchNitkuNumberToVatNumber_1 = require("./1793860000000000001-RenameBranchNitkuNumberToVatNumber");
Object.defineProperty(exports, "RenameBranchNitkuNumberToVatNumber1793860000001", { enumerable: true, get: function () { return _1793860000000000001_RenameBranchNitkuNumberToVatNumber_1.RenameBranchNitkuNumberToVatNumber1793860000001; } });
const _1793900000001_AddCustomerModuleRoles_1 = require("./1793900000001-AddCustomerModuleRoles");
Object.defineProperty(exports, "AddCustomerModuleRoles1793900000001", { enumerable: true, get: function () { return _1793900000001_AddCustomerModuleRoles_1.AddCustomerModuleRoles1793900000001; } });
const _1794000000000000_RestrictCustomerMenuToCustomerAdmins_1 = require("./1794000000000000-RestrictCustomerMenuToCustomerAdmins");
Object.defineProperty(exports, "RestrictCustomerMenuToCustomerAdmins1794000000000000", { enumerable: true, get: function () { return _1794000000000000_RestrictCustomerMenuToCustomerAdmins_1.RestrictCustomerMenuToCustomerAdmins1794000000000000; } });
/**
 * Standard package contract consumed by the host's generated registry.
 *
 * This module owns ONLY its core tables (customer, branch, staff,
 * customer_document). The province/regency tables belong to the region
 * module — region is a hard dependency (`requires: ['region']`) and its
 * migrations create the tables these FKs point at.
 */
exports.moduleMigrations = [
    _1793820000000000_CreateCustomerCoreTables_1.CreateCustomerCoreTables1793820000000,
    _1793850000000000001_AddCustomerCodeTriggers_1.AddCustomerCodeTriggers1793850000000,
    _1793860000000000001_RenameBranchNitkuNumberToVatNumber_1.RenameBranchNitkuNumberToVatNumber1793860000001,
    _1793900000001_AddCustomerModuleRoles_1.AddCustomerModuleRoles1793900000001,
    _1794000000000000_RestrictCustomerMenuToCustomerAdmins_1.RestrictCustomerMenuToCustomerAdmins1794000000000000,
];
