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
exports.CustomerScopeGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const customer_options_1 = require("../customer.options");
const customer_service_1 = require("../services/customer.service");
const branch_service_1 = require("../services/branch.service");
const staff_service_1 = require("../services/staff.service");
const customer_document_service_1 = require("../services/customer-document.service");
const customer_document_1 = require("../domain/customer-document");
const customer_resource_decorator_1 = require("./customer-resource.decorator");
const customer_scope_decorator_1 = require("./customer-scope.decorator");
const ACTION_BY_METHOD = {
    GET: 'read',
    HEAD: 'read',
    POST: 'create',
    PATCH: 'update',
    PUT: 'update',
    DELETE: 'delete',
};
let CustomerScopeGuard = class CustomerScopeGuard {
    constructor(reflector, customers, branches, staff, documents, options) {
        this.reflector = reflector;
        this.customers = customers;
        this.branches = branches;
        this.staff = staff;
        this.documents = documents;
        this.options = options;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (this.options?.isModuleActive && !(await this.options.isModuleActive())) {
            throw new common_1.ForbiddenException('Customer module is inactive');
        }
        const selfBranch = this.reflector.getAllAndOverride(customer_resource_decorator_1.CUSTOMER_SELF_BRANCH_METADATA, [context.getHandler(), context.getClass()]);
        if (selfBranch)
            return true;
        const source = this.reflector.getAllAndOverride(customer_scope_decorator_1.CUSTOMER_SCOPE_METADATA, [context.getHandler(), context.getClass()]);
        if (!source) {
            throw new common_1.ForbiddenException('Customer route is missing scope policy metadata');
        }
        const userId = request.user?.id;
        if (userId === undefined || userId === null) {
            throw new common_1.ForbiddenException();
        }
        if (source.kind === 'branch-list' ||
            source.kind === 'staff-list' ||
            source.kind === 'customer-list') {
            const resolveScopes = this.options?.resolveScopes;
            if (!resolveScopes) {
                throw new common_1.ForbiddenException('Scoped read authorization is not configured');
            }
            const resource = source.kind === 'branch-list'
                ? 'branch'
                : source.kind === 'staff-list'
                    ? (source.permissionResource ?? 'staff')
                    : 'customer';
            const resolvedScopes = await resolveScopes(userId, `read:${resource}`);
            request.customerAuthorizationScope = {
                global: resolvedScopes.global,
                customerIds: resolvedScopes.scopes
                    .filter((scope) => scope.type === 'customer')
                    .map((scope) => String(scope.id)),
                branchIds: resolvedScopes.scopes
                    .filter((scope) => scope.type === 'branch')
                    .map((scope) => String(scope.id)),
            };
            return true;
        }
        const authorizeScoped = this.options?.authorizeScoped;
        if (!authorizeScoped) {
            throw new common_1.ForbiddenException('Scoped authorization is not configured');
        }
        const resolved = await this.resolveTarget(source, request);
        const action = ACTION_BY_METHOD[request.method.toUpperCase()];
        const permission = action ? `${action}:${resolved.resource}` : null;
        if (!permission)
            throw new common_1.ForbiddenException();
        const allowed = await authorizeScoped(userId, permission, resolved.target);
        if (!allowed)
            throw new common_1.ForbiddenException();
        // A document may not be moved into a different owner scope merely by
        // changing ownerType/ownerId in the update payload. Authorize both the
        // stored owner and the requested destination before the service mutates.
        if (source.kind === 'document-lookup' &&
            (request.body?.ownerType !== undefined ||
                request.body?.ownerId !== undefined)) {
            const document = await this.documents.findDocumentById(this.readParam(request, source.param));
            if (!document)
                throw new common_1.NotFoundException();
            const destinationOwnerType = (request.body.ownerType ??
                document.ownerType);
            const destinationOwnerId = String(request.body.ownerId ?? document.ownerId);
            const destination = await this.resolveDocumentOwner(destinationOwnerType, destinationOwnerId);
            const destinationPermission = `${action}:${destination.resource}`;
            const canMoveDocument = await authorizeScoped(userId, destinationPermission, destination.target);
            if (!canMoveDocument)
                throw new common_1.ForbiddenException();
        }
        // Changing the head-office marker is a customer-level operation. A
        // branch-scoped administrator must not promote their own branch.
        if (resolved.branch &&
            request.body?.isHeadOffice !== undefined &&
            Boolean(request.body.isHeadOffice) !== resolved.branch.isHeadOffice) {
            const customerOnlyTarget = {
                scopes: [{ type: 'customer', id: resolved.branch.customerId }],
            };
            const canChangeHeadOffice = await authorizeScoped(userId, permission, customerOnlyTarget);
            if (!canChangeHeadOffice)
                throw new common_1.ForbiddenException();
        }
        return true;
    }
    async resolveTarget(source, request) {
        switch (source.kind) {
            case 'global-create':
                // A new customer has no existing tenant scope. Only the core wildcard
                // administrator can authorize this target-less operation.
                return { resource: 'customer', target: { scopes: [] } };
            case 'customer-param':
            case 'customer-lookup': {
                const id = this.readParam(request, source.param);
                const customer = await this.customers.findCustomerById(id);
                if (!customer)
                    throw new common_1.NotFoundException();
                return {
                    resource: 'customer',
                    target: { scopes: [{ type: 'customer', id: String(customer.id) }] },
                };
            }
            case 'branch-param':
            case 'branch-lookup': {
                const id = this.readParam(request, source.param);
                const branch = await this.branches.findBranchById(id);
                if (!branch)
                    throw new common_1.NotFoundException();
                const customer = await this.customers.findCustomerById(branch.customerId);
                if (!customer)
                    throw new common_1.NotFoundException();
                return {
                    resource: source.permissionResource ?? 'branch',
                    branch: {
                        id: String(branch.id),
                        customerId: String(branch.customerId),
                        isHeadOffice: Boolean(branch.isHeadOffice),
                    },
                    target: {
                        scopes: [
                            { type: 'branch', id: String(branch.id) },
                            { type: 'customer', id: String(customer.id) },
                        ],
                    },
                };
            }
            case 'staff-lookup': {
                const id = this.readParam(request, source.param);
                const staff = await this.staff.findStaffById(id);
                if (!staff)
                    throw new common_1.NotFoundException();
                const branch = await this.branches.findBranchById(staff.branchId);
                if (!branch)
                    throw new common_1.NotFoundException();
                const customer = await this.customers.findCustomerById(branch.customerId);
                if (!customer)
                    throw new common_1.NotFoundException();
                return {
                    resource: source.permissionResource ?? 'staff',
                    target: {
                        scopes: [
                            { type: 'branch', id: String(branch.id) },
                            { type: 'customer', id: String(customer.id) },
                        ],
                    },
                };
            }
            case 'document-owner-body':
            case 'document-owner-query': {
                const input = source.kind === 'document-owner-body'
                    ? request.body
                    : request.query;
                const ownerType = input?.ownerType;
                const ownerId = input?.ownerId;
                if (typeof ownerType !== 'string' || ownerId === undefined) {
                    throw new common_1.NotFoundException();
                }
                return this.resolveDocumentOwner(ownerType, String(ownerId));
            }
            case 'document-lookup': {
                const id = this.readParam(request, source.param);
                const document = await this.documents.findDocumentById(id);
                if (!document)
                    throw new common_1.NotFoundException();
                return this.resolveDocumentOwner(document.ownerType, String(document.ownerId));
            }
            default:
                throw new common_1.ForbiddenException('Unsupported customer scope source');
        }
    }
    async resolveDocumentOwner(ownerType, ownerId) {
        if (!/^\d+$/.test(ownerId))
            throw new common_1.NotFoundException();
        if (ownerType === customer_document_1.CustomerDocumentOwnerTypeEnum.CUSTOMER) {
            const customer = await this.customers.findCustomerById(ownerId);
            if (!customer)
                throw new common_1.NotFoundException();
            return {
                resource: 'customer',
                target: { scopes: [{ type: 'customer', id: String(customer.id) }] },
            };
        }
        if (ownerType === customer_document_1.CustomerDocumentOwnerTypeEnum.BRANCH) {
            return this.resolveTarget({ kind: 'branch-lookup', param: '__ownerId' }, { method: 'GET', params: { __ownerId: ownerId } });
        }
        if (ownerType === customer_document_1.CustomerDocumentOwnerTypeEnum.STAFF) {
            return this.resolveTarget({ kind: 'staff-lookup', param: '__ownerId' }, { method: 'GET', params: { __ownerId: ownerId } });
        }
        throw new common_1.NotFoundException();
    }
    readParam(request, name) {
        const value = request.params?.[name];
        if (!value || !/^\d+$/.test(value))
            throw new common_1.NotFoundException();
        return value;
    }
};
exports.CustomerScopeGuard = CustomerScopeGuard;
exports.CustomerScopeGuard = CustomerScopeGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Optional)()),
    __param(5, (0, common_1.Inject)(customer_options_1.CUSTOMER_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [core_1.Reflector,
        customer_service_1.CustomerService,
        branch_service_1.BranchService,
        staff_service_1.StaffService,
        customer_document_service_1.CustomerDocumentService, Object])
], CustomerScopeGuard);
