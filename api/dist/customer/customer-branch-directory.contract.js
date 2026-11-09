"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerBranchDirectoryContract = void 0;
const common_1 = require("@nestjs/common");
const branch_service_1 = require("./services/branch.service");
const MODULE_SERVICE_REGISTRY = Symbol.for("@wasnaker/module-runtime/service-registry");
const MODULE_LIFECYCLE_SERVICE = Symbol.for("@wasnaker/module-runtime/lifecycle");
/**
 * Customer publishes its read facade only while Customer is active. The
 * lifecycle manager owns activation/deactivation and restores it after restart.
 */
let CustomerBranchDirectoryContract = class CustomerBranchDirectoryContract {
    constructor(branches, registry, lifecycle) {
        this.branches = branches;
        this.registry = registry;
        this.lifecycle = lifecycle;
    }
    onModuleInit() {
        this.unregisterAdapter = this.lifecycle.registerRuntimeAdapter("customer", {
            activate: () => this.registerContract(),
        });
    }
    onModuleDestroy() {
        this.unregisterAdapter?.();
        this.unregisterAdapter = undefined;
    }
    registerContract() {
        const service = {
            findBranchById: async (id) => {
                const branch = await this.branches.findBranchById(id);
                if (!branch)
                    return null;
                return {
                    id: String(branch.id),
                    customerId: String(branch.customerId),
                    name: branch.name,
                    isHeadOffice: branch.isHeadOffice,
                    isActive: branch.isActive,
                };
            },
        };
        return this.registry.register({
            providerModuleId: "customer",
            contractId: "customer.branch-directory",
            version: "1.0.0",
            consumers: ["equipment"],
            service,
        });
    }
};
exports.CustomerBranchDirectoryContract = CustomerBranchDirectoryContract;
exports.CustomerBranchDirectoryContract = CustomerBranchDirectoryContract = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(MODULE_SERVICE_REGISTRY)),
    __param(2, (0, common_1.Inject)(MODULE_LIFECYCLE_SERVICE)),
    __metadata("design:paramtypes", [branch_service_1.BranchService, Object, Object])
], CustomerBranchDirectoryContract);
