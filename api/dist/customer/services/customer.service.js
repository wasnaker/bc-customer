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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_repository_1 = require("../infrastructure/persistence/customer.repository");
const branch_repository_1 = require("../infrastructure/persistence/branch.repository");
const customer_entity_1 = require("../infrastructure/persistence/relational/entities/customer.entity");
const branch_entity_1 = require("../infrastructure/persistence/relational/entities/branch.entity");
const customer_mapper_1 = require("../infrastructure/persistence/relational/mappers/customer.mapper");
const branch_mapper_1 = require("../infrastructure/persistence/relational/mappers/branch.mapper");
const region_validation_service_1 = require("./region-validation.service");
let CustomerService = class CustomerService {
    constructor(customerRepository, branchRepository, regionValidation, dataSource) {
        this.customerRepository = customerRepository;
        this.branchRepository = branchRepository;
        this.regionValidation = regionValidation;
        this.dataSource = dataSource;
    }
    async create(createCustomerDto) {
        const existing = await this.customerRepository.findByName(createCustomerDto.name);
        if (existing) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    name: 'customerNameAlreadyExists',
                },
            });
        }
        // Region is a hard dependency — validate the HO branch address against
        // the region tables (raw queries, no region module imports).
        await this.regionValidation.assertRegionPair(createCustomerDto.headOffice.provinceId, createCustomerDto.headOffice.cityId);
        // Contract J1: a customer is ALWAYS created together with its head-office
        // branch — both rows or neither.
        const created = await this.dataSource.transaction(async (manager) => {
            const customerEntity = await manager.save(manager.create(customer_entity_1.CustomerEntity, customer_mapper_1.CustomerMapper.toPersistence({
                name: createCustomerDto.name,
                userId: createCustomerDto.userId ?? null,
                npwpNumber: createCustomerDto.npwpNumber ?? null,
                nibNumber: createCustomerDto.nibNumber ?? null,
                isActive: createCustomerDto.isActive ?? true,
            })));
            const headOfficeEntity = await manager.save(manager.create(branch_entity_1.BranchEntity, branch_mapper_1.BranchMapper.toPersistence({
                customerId: customerEntity.id,
                name: createCustomerDto.headOffice.name,
                isHeadOffice: true,
                addressLine: createCustomerDto.headOffice.addressLine,
                provinceId: createCustomerDto.headOffice.provinceId,
                cityId: createCustomerDto.headOffice.cityId,
                postalCode: createCustomerDto.headOffice.postalCode ?? null,
                nitkuNumber: createCustomerDto.headOffice.nitkuNumber ?? null,
                vatType: createCustomerDto.headOffice.vatType ?? 'npwp',
                isActive: true,
            })));
            const customer = customer_mapper_1.CustomerMapper.toDomain(customerEntity);
            customer.headOffice = branch_mapper_1.BranchMapper.toDomain(headOfficeEntity);
            return customer;
        });
        return created;
    }
    async findManyWithPagination({ filterOptions, sortOptions, paginationOptions, }) {
        return this.customerRepository.findManyWithPagination({
            filterOptions,
            sortOptions,
            paginationOptions,
        });
    }
    async countWithFilter(filterOptions) {
        return this.customerRepository.countWithFilter(filterOptions);
    }
    async findCustomerById(id) {
        return this.customerRepository.findById(id);
    }
    async findHeadOffice(customerId) {
        return this.branchRepository.findHeadOfficeByCustomerId(customerId);
    }
    async update(id, updateCustomerDto) {
        const customer = await this.customerRepository.findById(id);
        if (!customer) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    customer: 'customerNotExists',
                },
            });
        }
        if (updateCustomerDto.name) {
            const existing = await this.customerRepository.findByName(updateCustomerDto.name);
            if (existing && String(existing.id) !== String(id)) {
                throw new common_1.UnprocessableEntityException({
                    status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        name: 'customerNameAlreadyExists',
                    },
                });
            }
        }
        const updated = await this.customerRepository.update(id, {
            ...updateCustomerDto,
        });
        if (!updated) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    customer: 'customerNotExists',
                },
            });
        }
        return updated;
    }
    async remove(id) {
        const customer = await this.customerRepository.findById(id);
        if (!customer) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    customer: 'customerNotExists',
                },
            });
        }
        try {
            // branch.customerId is FK CASCADE, so branches (and their staff via
            // RESTRICT) govern whether this succeeds — let the DB own integrity.
            await this.customerRepository.remove(id);
        }
        catch (error) {
            if (error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === '23503') {
                throw new common_1.UnprocessableEntityException({
                    status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        customer: 'customerHasStaff',
                    },
                });
            }
            throw error;
        }
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [customer_repository_1.CustomerRepository,
        branch_repository_1.BranchRepository,
        region_validation_service_1.RegionValidationService,
        typeorm_2.DataSource])
], CustomerService);
