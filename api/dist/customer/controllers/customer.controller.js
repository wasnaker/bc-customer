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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const create_customer_dto_1 = require("../dto/create-customer.dto");
const update_customer_dto_1 = require("../dto/update-customer.dto");
const query_customer_dto_1 = require("../dto/query-customer.dto");
const create_branch_dto_1 = require("../dto/create-branch.dto");
const update_branch_dto_1 = require("../dto/update-branch.dto");
const query_branch_dto_1 = require("../dto/query-branch.dto");
const create_staff_dto_1 = require("../dto/create-staff.dto");
const update_staff_dto_1 = require("../dto/update-staff.dto");
const query_staff_dto_1 = require("../dto/query-staff.dto");
const create_customer_document_dto_1 = require("../dto/create-customer-document.dto");
const update_customer_document_dto_1 = require("../dto/update-customer-document.dto");
const query_customer_document_dto_1 = require("../dto/query-customer-document.dto");
const customer_1 = require("../domain/customer");
const branch_1 = require("../domain/branch");
const staff_1 = require("../domain/staff");
const customer_document_1 = require("../domain/customer-document");
const customer_service_1 = require("../services/customer.service");
const branch_service_1 = require("../services/branch.service");
const staff_service_1 = require("../services/staff.service");
const customer_document_service_1 = require("../services/customer-document.service");
const customer_access_guard_1 = require("../security/customer-access.guard");
const customer_scope_guard_1 = require("../security/customer-scope.guard");
const customer_scope_decorator_1 = require("../security/customer-scope.decorator");
const customer_options_1 = require("../customer.options");
const customer_resource_decorator_1 = require("../security/customer-resource.decorator");
const infinity_pagination_response_dto_1 = require("../../utils/dto/infinity-pagination-response.dto");
const infinity_pagination_1 = require("../../utils/infinity-pagination");
/**
 * The host supplies JWT authentication and resolves module-declared action
 * permissions through CustomerAccessGuard; permission = `${action}:${resource}`
 * where the resource comes from @CustomerResource metadata (default 'customer'
 * and document ownerType for polymorphic document routes).
 */
let CustomerController = class CustomerController {
    constructor(customerService, branchService, staffService, customerDocumentService, moduleOptions) {
        this.customerService = customerService;
        this.branchService = branchService;
        this.staffService = staffService;
        this.customerDocumentService = customerDocumentService;
        this.moduleOptions = moduleOptions;
    }
    // ─── Documents (polymorphic: customer / branch / staff) ───────────────────
    // Declared before the `:id` customer routes so 'documents' is not captured
    // as an id param by NestJS route matching.
    createDocument(createCustomerDocumentDto) {
        return this.customerDocumentService.create(createCustomerDocumentDto);
    }
    async findDocuments(query) {
        const page = query?.page ?? 1;
        const limit = Math.min(query?.limit ?? 10, 50);
        const filterOptions = query.filters ?? null;
        const data = await this.customerDocumentService.findManyByOwner({
            ownerType: query.ownerType,
            ownerId: query.ownerId,
            filterOptions,
            sortOptions: query.sort ?? null,
            paginationOptions: { page, limit },
        });
        const total = await this.customerDocumentService.countByOwner(query.ownerType, query.ownerId, filterOptions);
        return (0, infinity_pagination_1.infinityPagination)(data, { page, limit }, total);
    }
    updateDocument(id, updateCustomerDocumentDto) {
        return this.customerDocumentService.update(id, updateCustomerDocumentDto);
    }
    removeDocument(id) {
        return this.customerDocumentService.remove(id);
    }
    // ─── Branches (global list) ────────────────────────────────────────────────
    // Declared before the `:id` customer routes so 'branches' is not captured
    // as an id param by NestJS route matching.
    async findAllBranches(request, query) {
        const page = query?.page ?? 1;
        const limit = Math.min(query?.limit ?? 10, 50);
        const filterOptions = query.filters ?? null;
        const customerId = query.customerId?.trim() || null;
        const scope = request.customerAuthorizationScope ?? {
            global: false,
            customerIds: [],
            branchIds: [],
        };
        const data = await this.branchService.findMany({
            customerId,
            filterOptions,
            sortOptions: query.sort ?? null,
            paginationOptions: { page, limit },
            scope,
        });
        const total = await this.branchService.countMany(customerId, filterOptions, scope);
        return (0, infinity_pagination_1.infinityPagination)(data, { page, limit }, total);
    }
    async findAllStaff(request, query) {
        const page = query?.page ?? 1;
        const limit = Math.min(query?.limit ?? 10, 50);
        const filterOptions = query.filters ?? null;
        const branchId = query.branchId?.trim() || null;
        const customerId = query.customerId?.trim() || null;
        const scope = request.customerAuthorizationScope ?? {
            global: false,
            customerIds: [],
            branchIds: [],
        };
        const data = await this.staffService.findMany({
            branchId,
            customerId,
            filterOptions,
            sortOptions: query.sort ?? null,
            paginationOptions: { page, limit },
            scope,
        });
        const total = await this.staffService.countMany(branchId, filterOptions, customerId, scope);
        return (0, infinity_pagination_1.infinityPagination)(data, { page, limit }, total);
    }
    /**
     * Returns the signed-in user's own resolved permissions/scopes for UI
     * affordances. API guards still re-evaluate every operation independently.
     */
    async findMyScope(request) {
        const userId = request.user?.id;
        if (userId === undefined || userId === null) {
            throw new common_1.UnauthorizedException();
        }
        const resolveScopes = this.moduleOptions?.resolveScopes;
        if (!resolveScopes) {
            throw new common_1.NotFoundException();
        }
        const permissionNames = [
            "read:customer",
            "create:customer",
            "read:branch",
            "read:staff",
            "create:branch",
            "update:branch",
            "delete:branch",
            "create:staff",
            "update:staff",
            "delete:staff",
            "read:my-customer-branch",
            "read:my-customer-staff",
            "update:my-customer-staff",
            "update:customer",
            "delete:customer",
        ];
        const resolved = await Promise.all(permissionNames.map(async (permission) => [
            permission,
            await resolveScopes(userId, permission),
        ]));
        const permissions = Object.fromEntries(resolved.map(([permission, scope]) => [
            permission,
            {
                global: scope.global,
                customerIds: scope.scopes
                    .filter((item) => item.type === "customer")
                    .map((item) => String(item.id)),
                branchIds: scope.scopes
                    .filter((item) => item.type === "branch")
                    .map((item) => String(item.id)),
            },
        ]));
        return {
            global: resolved.some(([, scope]) => scope.global),
            permissions,
        };
    }
    /**
     * Profile staff list. Scope is resolved from the dedicated Profile permission,
     * so Customer Admin receives company scope and Branch Admin receives only
     * the assigned branch scope. Client-supplied customer/branch IDs are ignored.
     */
    async findMyStaff(request, query) {
        const page = query?.page ?? 1;
        const limit = Math.min(query?.limit ?? 10, 50);
        const scope = request.customerAuthorizationScope ?? { global: false, customerIds: [], branchIds: [] };
        const data = await this.staffService.findMany({
            filterOptions: query.filters ?? null,
            sortOptions: query.sort ?? null,
            paginationOptions: { page, limit },
            scope,
        });
        const total = await this.staffService.countMany(null, query.filters ?? null, null, scope);
        return (0, infinity_pagination_1.infinityPagination)(data, { page, limit }, total);
    }
    /** Profile-only update endpoint; CustomerScopeGuard enforces the same role's scope. */
    updateMyStaff(id, updateStaffDto) {
        return this.staffService.update(id, updateStaffDto);
    }
    /**
     * Self-service branch lookup. The branch is derived only from the
     * authenticated user's linked staff record; no user/branch ID is accepted
     * from the client, so this endpoint cannot be used to enumerate other
     * customers or branches.
     */
    async findMyBranch(request) {
        const userId = Number(request.user?.id);
        if (!Number.isSafeInteger(userId) || userId <= 0) {
            throw new common_1.UnauthorizedException();
        }
        const staff = await this.staffService.findStaffByUserId(userId);
        if (!staff || !staff.isActive)
            throw new common_1.NotFoundException();
        const branch = await this.branchService.findBranchById(staff.branchId);
        if (!branch || !branch.isActive)
            throw new common_1.NotFoundException();
        const customer = await this.customerService.findCustomerById(branch.customerId);
        if (!customer?.isActive)
            throw new common_1.NotFoundException();
        return {
            ...branch,
            customerName: customer?.name ?? null,
            staffName: staff.name,
            staffPosition: staff.position,
        };
    }
    // ─── Customers ─────────────────────────────────────────────────────────────
    createCustomer(createCustomerDto) {
        return this.customerService.create(createCustomerDto);
    }
    async findCustomers(request, query) {
        const page = query?.page ?? 1;
        const limit = Math.min(query?.limit ?? 10, 50);
        const currentScope = request.customerAuthorizationScope ?? {
            global: false,
            customerIds: [],
            branchIds: [],
        };
        const scope = {
            global: currentScope.global,
            customerIds: currentScope.customerIds,
        };
        const data = await this.customerService.findManyWithPagination({
            filterOptions: query.filters ?? null,
            sortOptions: query.sort ?? null,
            paginationOptions: { page, limit },
            scope,
        });
        const total = await this.customerService.countWithFilter(query.filters ?? null, scope);
        return (0, infinity_pagination_1.infinityPagination)(data, { page, limit }, total);
    }
    findCustomerById(id) {
        // Route ini menangkap SEMUA segmen tunggal (mis. /customer/branch).
        // Id non-numerik bukan customer — balas 404, bukan 500 BigInt.
        if (!/^\d+$/.test(id)) {
            throw new common_1.NotFoundException();
        }
        return this.customerService.findCustomerById(id);
    }
    updateCustomer(id, updateCustomerDto) {
        return this.customerService.update(id, updateCustomerDto);
    }
    removeCustomer(id) {
        return this.customerService.remove(id);
    }
    // ─── Branches ──────────────────────────────────────────────────────────────
    createBranch(customerId, createBranchDto, request) {
        const actorUserId = Number(request.user?.id);
        if (!Number.isSafeInteger(actorUserId) || actorUserId <= 0)
            throw new common_1.UnauthorizedException();
        return this.branchService.create(customerId, createBranchDto, actorUserId);
    }
    async findBranches(customerId, query) {
        const page = query?.page ?? 1;
        const limit = Math.min(query?.limit ?? 10, 50);
        const filterOptions = query.filters ?? null;
        const data = await this.branchService.findManyByCustomerId({
            customerId,
            filterOptions,
            sortOptions: query.sort ?? null,
            paginationOptions: { page, limit },
        });
        const total = await this.branchService.countByCustomerId(customerId, filterOptions);
        return (0, infinity_pagination_1.infinityPagination)(data, { page, limit }, total);
    }
    findBranchById(id) {
        return this.branchService.findBranchById(id);
    }
    updateBranch(id, updateBranchDto) {
        return this.branchService.update(id, updateBranchDto);
    }
    removeBranch(id) {
        return this.branchService.remove(id);
    }
    // ─── Staff ─────────────────────────────────────────────────────────────────
    createStaff(branchId, createStaffDto, request) {
        const actorUserId = Number(request.user?.id);
        if (!Number.isSafeInteger(actorUserId) || actorUserId <= 0)
            throw new common_1.UnauthorizedException();
        return this.staffService.create(branchId, createStaffDto, actorUserId);
    }
    async findStaff(branchId, query) {
        const page = query?.page ?? 1;
        const limit = Math.min(query?.limit ?? 10, 50);
        const filterOptions = query.filters ?? null;
        const data = await this.staffService.findManyByBranchId({
            branchId,
            filterOptions,
            sortOptions: query.sort ?? null,
            paginationOptions: { page, limit },
        });
        const total = await this.staffService.countByBranchId(branchId, filterOptions);
        return (0, infinity_pagination_1.infinityPagination)(data, { page, limit }, total);
    }
    findStaffById(id) {
        return this.staffService.findStaffById(id);
    }
    updateStaff(id, updateStaffDto) {
        return this.staffService.update(id, updateStaffDto);
    }
    removeStaff(id) {
        return this.staffService.remove(id);
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, swagger_1.ApiCreatedResponse)({ type: customer_document_1.CustomerDocument }),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'document-owner-body' }),
    (0, common_1.Post)("documents"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_document_dto_1.CreateCustomerDocumentDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createDocument", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(customer_document_1.CustomerDocument) }),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'document-owner-query' }),
    (0, common_1.Get)("documents"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_customer_document_dto_1.QueryCustomerDocumentDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findDocuments", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: customer_document_1.CustomerDocument }),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'document-lookup', param: 'id' }),
    (0, common_1.Patch)("documents/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_document_dto_1.UpdateCustomerDocumentDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateDocument", null);
__decorate([
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'document-lookup', param: 'id' }),
    (0, common_1.Delete)("documents/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeDocument", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(branch_1.Branch) }),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'branch-list' }),
    (0, customer_resource_decorator_1.CustomerResource)("branch"),
    (0, common_1.Get)("branches"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_branch_dto_1.QueryBranchDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findAllBranches", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(staff_1.Staff) }),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'staff-list' }),
    (0, customer_resource_decorator_1.CustomerResource)("staff"),
    (0, common_1.Get)("staff"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_staff_dto_1.QueryStaffDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findAllStaff", null);
__decorate([
    (0, customer_resource_decorator_1.CustomerSelfBranch)(),
    (0, common_1.Get)("me/scope"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findMyScope", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(staff_1.Staff) }),
    (0, customer_resource_decorator_1.CustomerResource)("my-customer-staff"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'staff-list', permissionResource: 'my-customer-staff' }),
    (0, common_1.Get)("me/staff"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_staff_dto_1.QueryStaffDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findMyStaff", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: staff_1.Staff }),
    (0, customer_resource_decorator_1.CustomerResource)("my-customer-staff"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'staff-lookup', param: 'id', permissionResource: 'my-customer-staff' }),
    (0, common_1.Patch)("me/staff/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_staff_dto_1.UpdateStaffDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateMyStaff", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: branch_1.Branch }),
    (0, customer_resource_decorator_1.CustomerSelfBranch)("read:my-customer-company"),
    (0, common_1.Get)("me/branch"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findMyBranch", null);
__decorate([
    (0, swagger_1.ApiCreatedResponse)({ type: customer_1.Customer }),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'global-create' }),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createCustomer", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(customer_1.Customer) }),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'customer-list' }),
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_customer_dto_1.QueryCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findCustomers", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: customer_1.Customer }),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'customer-lookup', param: 'id' }),
    (0, common_1.Get)(":id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findCustomerById", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: customer_1.Customer }),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'customer-lookup', param: 'id' }),
    (0, common_1.Patch)(":id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateCustomer", null);
__decorate([
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'customer-lookup', param: 'id' }),
    (0, common_1.Delete)(":id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeCustomer", null);
__decorate([
    (0, swagger_1.ApiCreatedResponse)({ type: branch_1.Branch }),
    (0, customer_resource_decorator_1.CustomerResource)("branch"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'customer-param', param: 'customerId' }),
    (0, common_1.Post)(":customerId/branches"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiParam)({ name: "customerId", type: String, required: true }),
    __param(0, (0, common_1.Param)("customerId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_branch_dto_1.CreateBranchDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createBranch", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(branch_1.Branch) }),
    (0, customer_resource_decorator_1.CustomerResource)("branch"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'customer-param', param: 'customerId' }),
    (0, common_1.Get)(":customerId/branches"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: "customerId", type: String, required: true }),
    __param(0, (0, common_1.Param)("customerId")),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_branch_dto_1.QueryBranchDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findBranches", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: branch_1.Branch }),
    (0, customer_resource_decorator_1.CustomerResource)("branch"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'branch-lookup', param: 'id' }),
    (0, common_1.Get)("branches/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findBranchById", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: branch_1.Branch }),
    (0, customer_resource_decorator_1.CustomerResource)("branch"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'branch-lookup', param: 'id' }),
    (0, common_1.Patch)("branches/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_branch_dto_1.UpdateBranchDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateBranch", null);
__decorate([
    (0, customer_resource_decorator_1.CustomerResource)("branch"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'branch-lookup', param: 'id' }),
    (0, common_1.Delete)("branches/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeBranch", null);
__decorate([
    (0, swagger_1.ApiCreatedResponse)({ type: staff_1.Staff }),
    (0, customer_resource_decorator_1.CustomerResource)("staff"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'branch-param', param: 'branchId', permissionResource: 'staff' }),
    (0, common_1.Post)("branches/:branchId/staff"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiParam)({ name: "branchId", type: String, required: true }),
    __param(0, (0, common_1.Param)("branchId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_staff_dto_1.CreateStaffDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createStaff", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(staff_1.Staff) }),
    (0, customer_resource_decorator_1.CustomerResource)("staff"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'branch-param', param: 'branchId', permissionResource: 'staff' }),
    (0, common_1.Get)("branches/:branchId/staff"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: "branchId", type: String, required: true }),
    __param(0, (0, common_1.Param)("branchId")),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_staff_dto_1.QueryStaffDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findStaff", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: staff_1.Staff }),
    (0, customer_resource_decorator_1.CustomerResource)("staff"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'staff-lookup', param: 'id' }),
    (0, common_1.Get)("staff/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findStaffById", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: staff_1.Staff }),
    (0, customer_resource_decorator_1.CustomerResource)("staff"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'staff-lookup', param: 'id' }),
    (0, common_1.Patch)("staff/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_staff_dto_1.UpdateStaffDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateStaff", null);
__decorate([
    (0, customer_resource_decorator_1.CustomerResource)("staff"),
    (0, customer_scope_decorator_1.CustomerScope)({ kind: 'staff-lookup', param: 'id' }),
    (0, common_1.Delete)("staff/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiParam)({ name: "id", type: String, required: true }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeStaff", null);
exports.CustomerController = CustomerController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt"), customer_access_guard_1.CustomerAccessGuard, customer_scope_guard_1.CustomerScopeGuard),
    (0, swagger_1.ApiTags)("Customer"),
    (0, common_1.Controller)({ path: "customer", version: "1" }),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, common_1.Inject)(customer_options_1.CUSTOMER_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [customer_service_1.CustomerService,
        branch_service_1.BranchService,
        staff_service_1.StaffService,
        customer_document_service_1.CustomerDocumentService, Object])
], CustomerController);
