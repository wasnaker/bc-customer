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
    constructor(customerService, branchService, staffService, customerDocumentService) {
        this.customerService = customerService;
        this.branchService = branchService;
        this.staffService = staffService;
        this.customerDocumentService = customerDocumentService;
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
    // ─── Customers ─────────────────────────────────────────────────────────────
    createCustomer(createCustomerDto) {
        return this.customerService.create(createCustomerDto);
    }
    async findCustomers(query) {
        const page = query?.page ?? 1;
        const limit = Math.min(query?.limit ?? 10, 50);
        const data = await this.customerService.findManyWithPagination({
            filterOptions: query.filters ?? null,
            sortOptions: query.sort ?? null,
            paginationOptions: { page, limit },
        });
        const total = await this.customerService.countWithFilter(query.filters ?? null);
        return (0, infinity_pagination_1.infinityPagination)(data, { page, limit }, total);
    }
    findCustomerById(id) {
        return this.customerService.findCustomerById(id);
    }
    updateCustomer(id, updateCustomerDto) {
        return this.customerService.update(id, updateCustomerDto);
    }
    removeCustomer(id) {
        return this.customerService.remove(id);
    }
    // ─── Branches ──────────────────────────────────────────────────────────────
    createBranch(customerId, createBranchDto) {
        return this.branchService.create(customerId, createBranchDto);
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
    createStaff(branchId, createStaffDto) {
        return this.staffService.create(branchId, createStaffDto);
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
    (0, common_1.Post)('documents'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_document_dto_1.CreateCustomerDocumentDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createDocument", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(customer_document_1.CustomerDocument) }),
    (0, common_1.Get)('documents'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_customer_document_dto_1.QueryCustomerDocumentDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findDocuments", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: customer_document_1.CustomerDocument }),
    (0, common_1.Patch)('documents/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_document_dto_1.UpdateCustomerDocumentDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateDocument", null);
__decorate([
    (0, common_1.Delete)('documents/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeDocument", null);
__decorate([
    (0, swagger_1.ApiCreatedResponse)({ type: customer_1.Customer }),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createCustomer", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(customer_1.Customer) }),
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_customer_dto_1.QueryCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findCustomers", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: customer_1.Customer }),
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findCustomerById", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: customer_1.Customer }),
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeCustomer", null);
__decorate([
    (0, swagger_1.ApiCreatedResponse)({ type: branch_1.Branch }),
    (0, customer_resource_decorator_1.CustomerResource)('branch'),
    (0, common_1.Post)(':customerId/branches'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiParam)({ name: 'customerId', type: String, required: true }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_branch_dto_1.CreateBranchDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createBranch", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(branch_1.Branch) }),
    (0, customer_resource_decorator_1.CustomerResource)('branch'),
    (0, common_1.Get)(':customerId/branches'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'customerId', type: String, required: true }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_branch_dto_1.QueryBranchDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findBranches", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: branch_1.Branch }),
    (0, customer_resource_decorator_1.CustomerResource)('branch'),
    (0, common_1.Get)('branches/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findBranchById", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: branch_1.Branch }),
    (0, customer_resource_decorator_1.CustomerResource)('branch'),
    (0, common_1.Patch)('branches/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_branch_dto_1.UpdateBranchDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateBranch", null);
__decorate([
    (0, customer_resource_decorator_1.CustomerResource)('branch'),
    (0, common_1.Delete)('branches/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeBranch", null);
__decorate([
    (0, swagger_1.ApiCreatedResponse)({ type: staff_1.Staff }),
    (0, customer_resource_decorator_1.CustomerResource)('staff'),
    (0, common_1.Post)('branches/:branchId/staff'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiParam)({ name: 'branchId', type: String, required: true }),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_staff_dto_1.CreateStaffDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createStaff", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(staff_1.Staff) }),
    (0, customer_resource_decorator_1.CustomerResource)('staff'),
    (0, common_1.Get)('branches/:branchId/staff'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'branchId', type: String, required: true }),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_staff_dto_1.QueryStaffDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findStaff", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: staff_1.Staff }),
    (0, customer_resource_decorator_1.CustomerResource)('staff'),
    (0, common_1.Get)('staff/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findStaffById", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: staff_1.Staff }),
    (0, customer_resource_decorator_1.CustomerResource)('staff'),
    (0, common_1.Patch)('staff/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_staff_dto_1.UpdateStaffDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateStaff", null);
__decorate([
    (0, customer_resource_decorator_1.CustomerResource)('staff'),
    (0, common_1.Delete)('staff/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeStaff", null);
exports.CustomerController = CustomerController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), customer_access_guard_1.CustomerAccessGuard),
    (0, swagger_1.ApiTags)('Customer'),
    (0, common_1.Controller)({ path: 'customer', version: '1' }),
    __metadata("design:paramtypes", [customer_service_1.CustomerService,
        branch_service_1.BranchService,
        staff_service_1.StaffService,
        customer_document_service_1.CustomerDocumentService])
], CustomerController);
