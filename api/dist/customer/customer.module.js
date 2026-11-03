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
const typeorm_1 = require("@nestjs/typeorm");
const province_entity_1 = require("./infrastructure/persistence/relational/entities/province.entity");
const regency_entity_1 = require("./infrastructure/persistence/relational/entities/regency.entity");
const customer_service_1 = require("./services/customer.service");
const customer_controller_1 = require("./controllers/customer.controller");
const customer_seed_service_1 = require("./database/customer-seed.service");
const province_repository_1 = require("./infrastructure/persistence/province.repository");
const regency_repository_1 = require("./infrastructure/persistence/regency.repository");
const province_repository_2 = require("./infrastructure/persistence/relational/repositories/province.repository");
const regency_repository_2 = require("./infrastructure/persistence/relational/repositories/regency.repository");
const customer_access_guard_1 = require("./security/customer-access.guard");
const customer_options_1 = require("./customer.options");
var customer_options_2 = require("./customer.options");
Object.defineProperty(exports, "CUSTOMER_MODULE_OPTIONS", { enumerable: true, get: function () { return customer_options_2.CUSTOMER_MODULE_OPTIONS; } });
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
        imports: [typeorm_1.TypeOrmModule.forFeature([province_entity_1.ProvinceEntity, regency_entity_1.RegencyEntity])],
        providers: [
            customer_service_1.CustomerService,
            customer_seed_service_1.CustomerSeedService,
            customer_access_guard_1.CustomerAccessGuard,
            { provide: province_repository_1.ProvinceRepository, useClass: province_repository_2.ProvincesRelationalRepository },
            { provide: regency_repository_1.RegencyRepository, useClass: regency_repository_2.RegenciesRelationalRepository },
        ],
        controllers: [customer_controller_1.CustomerController],
        exports: [customer_service_1.CustomerService, customer_seed_service_1.CustomerSeedService],
    })
], CustomerModule);
