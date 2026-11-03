"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleMigrations = exports.AddRegencyCode1793710213000000000 = exports.AddCustomerUniquenessConstraints1793466257948612618 = exports.CreateCustomer1793466257948612617 = void 0;
const _1793466257948612617_CreateCustomer_1 = require("./1793466257948612617-CreateCustomer");
Object.defineProperty(exports, "CreateCustomer1793466257948612617", { enumerable: true, get: function () { return _1793466257948612617_CreateCustomer_1.CreateCustomer1793466257948612617; } });
const _1793466257948612618_AddCustomerUniquenessConstraints_1 = require("./1793466257948612618-AddCustomerUniquenessConstraints");
Object.defineProperty(exports, "AddCustomerUniquenessConstraints1793466257948612618", { enumerable: true, get: function () { return _1793466257948612618_AddCustomerUniquenessConstraints_1.AddCustomerUniquenessConstraints1793466257948612618; } });
const _1793710213000000000_AddRegencyCode_1 = require("./1793710213000000000-AddRegencyCode");
Object.defineProperty(exports, "AddRegencyCode1793710213000000000", { enumerable: true, get: function () { return _1793710213000000000_AddRegencyCode_1.AddRegencyCode1793710213000000000; } });
/** Standard package contract consumed by the host's generated registry. */
exports.moduleMigrations = [
    _1793466257948612617_CreateCustomer_1.CreateCustomer1793466257948612617,
    _1793466257948612618_AddCustomerUniquenessConstraints_1.AddCustomerUniquenessConstraints1793466257948612618,
    _1793710213000000000_AddRegencyCode_1.AddRegencyCode1793710213000000000,
];
