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
const create_province_dto_1 = require("../dto/create-province.dto");
const update_province_dto_1 = require("../dto/update-province.dto");
const query_province_dto_1 = require("../dto/query-province.dto");
const create_regency_dto_1 = require("../dto/create-regency.dto");
const update_regency_dto_1 = require("../dto/update-regency.dto");
const query_regency_dto_1 = require("../dto/query-regency.dto");
const province_1 = require("../domain/province");
const regency_1 = require("../domain/regency");
const customer_service_1 = require("../services/customer.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const customer_access_guard_1 = require("../security/customer-access.guard");
const infinity_pagination_response_dto_1 = require("../../utils/dto/infinity-pagination-response.dto");
const infinity_pagination_1 = require("../../utils/infinity-pagination");
// The host supplies JWT authentication and resolves module-declared action
// permissions through CustomerAccessGuard; no host-specific role IDs are assumed.
let CustomerController = class CustomerController {
    constructor(customerService) {
        this.customerService = customerService;
    }
    // ─── Provinces ─────────────────────────────────────────────────────────────
    createProvince(createProvinceDto) {
        return this.customerService.createProvince(createProvinceDto);
    }
    async findAllProvinces(query) {
        const page = query?.page ?? 1;
        let limit = query?.limit ?? 10;
        if (limit > 50) {
            limit = 50;
        }
        const data = await this.customerService.findManyProvincesWithPagination({
            filterOptions: query.filters ?? null,
            sortOptions: query.sort ?? null,
            paginationOptions: { page, limit },
        });
        const total = await this.customerService.countProvinces(query.filters ?? null);
        return (0, infinity_pagination_1.infinityPagination)(data, { page, limit }, total);
    }
    findOneProvince(id) {
        return this.customerService.findProvinceById(id);
    }
    updateProvince(id, updateProvinceDto) {
        return this.customerService.updateProvince(id, updateProvinceDto);
    }
    removeProvince(id) {
        return this.customerService.removeProvince(id);
    }
    // ─── Regencies ─────────────────────────────────────────────────────────────
    createRegency(createRegencyDto) {
        return this.customerService.createRegency(createRegencyDto);
    }
    async findAllRegencies(query) {
        const page = query?.page ?? 1;
        let limit = query?.limit ?? 10;
        if (limit > 50) {
            limit = 50;
        }
        const filterOptions = query.filters ?? {};
        if (filterOptions) {
            if (query.provinceId !== undefined) {
                filterOptions.provinceId = query.provinceId;
            }
        }
        const data = await this.customerService.findManyRegenciesWithPagination({
            filterOptions,
            sortOptions: query.sort ?? null,
            paginationOptions: { page, limit },
        });
        const total = await this.customerService.countRegencies(filterOptions);
        return (0, infinity_pagination_1.infinityPagination)(data, { page, limit }, total);
    }
    findOneRegency(id) {
        return this.customerService.findRegencyById(id);
    }
    updateRegency(id, updateRegencyDto) {
        return this.customerService.updateRegency(id, updateRegencyDto);
    }
    removeRegency(id) {
        return this.customerService.removeRegency(id);
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, swagger_1.ApiCreatedResponse)({ type: province_1.Province }),
    (0, common_1.UseGuards)(customer_access_guard_1.CustomerAccessGuard),
    (0, common_1.Post)('provinces'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_province_dto_1.CreateProvinceDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createProvince", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(province_1.Province) }),
    (0, common_1.Get)('provinces'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_province_dto_1.QueryProvinceDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findAllProvinces", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: province_1.Province }),
    (0, common_1.Get)('provinces/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findOneProvince", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: province_1.Province }),
    (0, common_1.UseGuards)(customer_access_guard_1.CustomerAccessGuard),
    (0, common_1.Patch)('provinces/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_province_dto_1.UpdateProvinceDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateProvince", null);
__decorate([
    (0, common_1.UseGuards)(customer_access_guard_1.CustomerAccessGuard),
    (0, common_1.Delete)('provinces/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeProvince", null);
__decorate([
    (0, swagger_1.ApiCreatedResponse)({ type: regency_1.Regency }),
    (0, common_1.UseGuards)(customer_access_guard_1.CustomerAccessGuard),
    (0, common_1.Post)('regencies'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_regency_dto_1.CreateRegencyDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createRegency", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: (0, infinity_pagination_response_dto_1.InfinityPaginationResponse)(regency_1.Regency) }),
    (0, common_1.Get)('regencies'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_regency_dto_1.QueryRegencyDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findAllRegencies", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: regency_1.Regency }),
    (0, common_1.Get)('regencies/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findOneRegency", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ type: regency_1.Regency }),
    (0, common_1.UseGuards)(customer_access_guard_1.CustomerAccessGuard),
    (0, common_1.Patch)('regencies/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_regency_dto_1.UpdateRegencyDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateRegency", null);
__decorate([
    (0, common_1.UseGuards)(customer_access_guard_1.CustomerAccessGuard),
    (0, common_1.Delete)('regencies/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, required: true }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "removeRegency", null);
exports.CustomerController = CustomerController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiTags)('Customer'),
    (0, common_1.Controller)({ path: 'customer', version: '1' }),
    __metadata("design:paramtypes", [customer_service_1.CustomerService])
], CustomerController);
