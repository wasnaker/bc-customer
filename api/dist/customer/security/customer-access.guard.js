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
exports.CustomerAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const customer_options_1 = require("../customer.options");
const customer_resource_decorator_1 = require("./customer-resource.decorator");
const customer_scope_decorator_1 = require("./customer-scope.decorator");
const customer_document_1 = require("../domain/customer-document");
const ACTION_BY_METHOD = {
    GET: 'read',
    HEAD: 'read',
    POST: 'create',
    PATCH: 'update',
    PUT: 'update',
    DELETE: 'delete',
};
let CustomerAccessGuard = class CustomerAccessGuard {
    constructor(options, reflector) {
        this.options = options;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (this.options?.isModuleActive && !(await this.options.isModuleActive())) {
            throw new common_1.ForbiddenException('Customer module is inactive');
        }
        const selfBranch = this.reflector?.getAllAndOverride(customer_resource_decorator_1.CUSTOMER_SELF_BRANCH_METADATA, [context.getHandler(), context.getClass()]);
        if (selfBranch) {
            if (request.user?.id === undefined || request.user?.id === null) {
                throw new common_1.ForbiddenException();
            }
            if (typeof selfBranch === 'string') {
                const assignedRoles = request.user?.roles?.length
                    ? request.user.roles
                    : request.user?.role
                        ? [request.user.role]
                        : [];
                const roleIds = [...new Set(assignedRoles.map((role) => role.id).filter((id) => id !== undefined && id !== null))];
                if (!this.options?.authorize || roleIds.length === 0) {
                    throw new common_1.ForbiddenException();
                }
                for (const roleId of roleIds) {
                    if (await this.options.authorize(roleId, selfBranch))
                        return true;
                }
                throw new common_1.ForbiddenException();
            }
            return true;
        }
        // Polymorphic documents derive their resource permission from the stored
        // owner. CustomerScopeGuard resolves that owner and performs the complete
        // permission + scope check; do not guess "customer" before that lookup.
        const scopeSource = this.reflector?.getAllAndOverride(customer_scope_decorator_1.CUSTOMER_SCOPE_METADATA, [context.getHandler(), context.getClass()]);
        if (scopeSource?.kind.startsWith('document-')) {
            if (request.user?.id === undefined || request.user?.id === null) {
                throw new common_1.ForbiddenException();
            }
            return true;
        }
        const action = ACTION_BY_METHOD[request.method.toUpperCase()];
        const resource = this.resolveResource(context, request);
        const permission = action ? `${action}:${resource}` : null;
        const assignedRoles = request.user?.roles?.length
            ? request.user.roles
            : request.user?.role
                ? [request.user.role]
                : [];
        const roleIds = [
            ...new Set(assignedRoles.map((role) => role.id).filter((id) => id !== undefined && id !== null)),
        ];
        if (!permission || roleIds.length === 0 || !this.options?.authorize) {
            throw new common_1.ForbiddenException();
        }
        for (const roleId of roleIds) {
            if (await this.options.authorize(roleId, permission))
                return true;
        }
        throw new common_1.ForbiddenException();
    }
    resolveResource(context, request) {
        const metadata = this.reflector?.getAllAndOverride(customer_resource_decorator_1.CUSTOMER_RESOURCE_METADATA, [context.getHandler(), context.getClass()]);
        if (metadata)
            return metadata;
        const ownerType = request.query?.ownerType ?? request.body?.ownerType;
        if (typeof ownerType === 'string' &&
            customer_document_1.CUSTOMER_DOCUMENT_OWNER_TYPES.includes(ownerType)) {
            return ownerType;
        }
        return 'customer';
    }
};
exports.CustomerAccessGuard = CustomerAccessGuard;
exports.CustomerAccessGuard = CustomerAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, common_1.Inject)(customer_options_1.CUSTOMER_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object, core_1.Reflector])
], CustomerAccessGuard);
