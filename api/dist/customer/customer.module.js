"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CustomerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModule = exports.CUSTOMER_MODULE_OPTIONS = void 0;
const common_1 = require("@nestjs/common");
const customer_access_guard_1 = require("./security/customer-access.guard");
const customer_options_1 = require("./customer.options");
var customer_options_2 = require("./customer.options");
Object.defineProperty(exports, "CUSTOMER_MODULE_OPTIONS", { enumerable: true, get: function () { return customer_options_2.CUSTOMER_MODULE_OPTIONS; } });
/**
 * Phase 3 (entities) module shell: entities, migrations and ULID/code hooks
 * travel with the entity classes (method-level listeners), so no subscriber
 * registration is required here. Services/controllers arrive in a later
 * phase and will be added to providers/controllers then.
 */
let CustomerModule = CustomerModule_1 = class CustomerModule {
    static registerAsync(options) {
        const optionsProvider = {
            provide: customer_options_1.CUSTOMER_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject ?? [],
        };
        return {
            module: CustomerModule_1,
            imports: options.imports ?? [],
            providers: [optionsProvider],
        };
    }
};
exports.CustomerModule = CustomerModule;
exports.CustomerModule = CustomerModule = CustomerModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [customer_access_guard_1.CustomerAccessGuard],
        exports: [customer_access_guard_1.CustomerAccessGuard],
    })
], CustomerModule);
