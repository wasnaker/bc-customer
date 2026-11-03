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
const customer_entity_1 = require("./infrastructure/persistence/relational/entities/customer.entity");
const branch_entity_1 = require("./infrastructure/persistence/relational/entities/branch.entity");
const staff_entity_1 = require("./infrastructure/persistence/relational/entities/staff.entity");
const customer_document_entity_1 = require("./infrastructure/persistence/relational/entities/customer-document.entity");
const customer_service_1 = require("./services/customer.service");
const branch_service_1 = require("./services/branch.service");
const staff_service_1 = require("./services/staff.service");
const customer_document_service_1 = require("./services/customer-document.service");
const region_validation_service_1 = require("./services/region-validation.service");
const customer_controller_1 = require("./controllers/customer.controller");
const customer_repository_1 = require("./infrastructure/persistence/customer.repository");
const branch_repository_1 = require("./infrastructure/persistence/branch.repository");
const staff_repository_1 = require("./infrastructure/persistence/staff.repository");
const customer_document_repository_1 = require("./infrastructure/persistence/customer-document.repository");
const customer_repository_2 = require("./infrastructure/persistence/relational/repositories/customer.repository");
const branch_repository_2 = require("./infrastructure/persistence/relational/repositories/branch.repository");
const staff_repository_2 = require("./infrastructure/persistence/relational/repositories/staff.repository");
const customer_document_repository_2 = require("./infrastructure/persistence/relational/repositories/customer-document.repository");
const customer_access_guard_1 = require("./security/customer-access.guard");
const customer_options_1 = require("./customer.options");
var customer_options_2 = require("./customer.options");
Object.defineProperty(exports, "CUSTOMER_MODULE_OPTIONS", { enumerable: true, get: function () { return customer_options_2.CUSTOMER_MODULE_OPTIONS; } });
/**
 * Phase 4 (API layer) module: controllers, services and repositories on top
 * of the Phase 3 entities. Region is a hard dependency (`requires: ['region']`
 * in the manifest) — province/regency tables are NOT created or imported here;
 * region validation runs raw queries against those well-known tables.
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
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                customer_entity_1.CustomerEntity,
                branch_entity_1.BranchEntity,
                staff_entity_1.StaffEntity,
                customer_document_entity_1.CustomerDocumentEntity,
            ]),
        ],
        providers: [
            customer_service_1.CustomerService,
            branch_service_1.BranchService,
            staff_service_1.StaffService,
            customer_document_service_1.CustomerDocumentService,
            region_validation_service_1.RegionValidationService,
            customer_access_guard_1.CustomerAccessGuard,
            { provide: customer_repository_1.CustomerRepository, useClass: customer_repository_2.CustomersRelationalRepository },
            { provide: branch_repository_1.BranchRepository, useClass: branch_repository_2.BranchesRelationalRepository },
            { provide: staff_repository_1.StaffRepository, useClass: staff_repository_2.StaffRelationalRepository },
            {
                provide: customer_document_repository_1.CustomerDocumentRepository,
                useClass: customer_document_repository_2.CustomerDocumentsRelationalRepository,
            },
        ],
        controllers: [customer_controller_1.CustomerController],
        exports: [
            customer_service_1.CustomerService,
            branch_service_1.BranchService,
            staff_service_1.StaffService,
            customer_document_service_1.CustomerDocumentService,
            customer_access_guard_1.CustomerAccessGuard,
        ],
    })
], CustomerModule);
