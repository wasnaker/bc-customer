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
exports.CustomerCoreAccountProvisioningClient = void 0;
const common_1 = require("@nestjs/common");
const MODULE_SERVICE_REGISTRY = Symbol.for("@wasnaker/module-runtime/service-registry");
/** Customer delegates account creation and compensation to the Core contract. */
let CustomerCoreAccountProvisioningClient = class CustomerCoreAccountProvisioningClient {
    constructor(registry) {
        this.registry = registry;
    }
    create(input) {
        const provisioning = this.registry.resolve("customer", "core.account-provisioning", "^1.0.0");
        return provisioning.create({ ...input, moduleId: "customer" });
    }
    remove(userId) {
        const provisioning = this.registry.resolve("customer", "core.account-provisioning", "^1.0.0");
        return provisioning.remove(userId);
    }
};
exports.CustomerCoreAccountProvisioningClient = CustomerCoreAccountProvisioningClient;
exports.CustomerCoreAccountProvisioningClient = CustomerCoreAccountProvisioningClient = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(MODULE_SERVICE_REGISTRY)),
    __metadata("design:paramtypes", [Object])
], CustomerCoreAccountProvisioningClient);
