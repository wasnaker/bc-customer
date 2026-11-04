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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchService = void 0;
const common_1 = require("@nestjs/common");
const customer_repository_1 = require("../infrastructure/persistence/customer.repository");
const branch_repository_1 = require("../infrastructure/persistence/branch.repository");
const region_validation_service_1 = require("./region-validation.service");
let BranchService = class BranchService {
    constructor(branchRepository, customerRepository, regionValidation) {
        this.branchRepository = branchRepository;
        this.customerRepository = customerRepository;
        this.regionValidation = regionValidation;
    }
    async create(customerId, createBranchDto) {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    customer: "customerNotExists",
                },
            });
        }
        await this.regionValidation.assertRegionPair(createBranchDto.provinceId, createBranchDto.cityId);
        if (createBranchDto.isHeadOffice) {
            await this.assertHeadOfficeAvailable(customerId);
        }
        return this.branchRepository.create({
            customerId,
            name: createBranchDto.name,
            isHeadOffice: createBranchDto.isHeadOffice ?? false,
            addressLine: createBranchDto.addressLine,
            provinceId: createBranchDto.provinceId,
            cityId: createBranchDto.cityId,
            postalCode: createBranchDto.postalCode ?? null,
            nitkuNumber: createBranchDto.nitkuNumber ?? null,
            vatType: createBranchDto.vatType ?? "npwp",
            isActive: createBranchDto.isActive ?? true,
        });
    }
    async findManyByCustomerId({ customerId, filterOptions, sortOptions, paginationOptions, }) {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    customer: "customerNotExists",
                },
            });
        }
        return this.branchRepository.findManyByCustomerId({
            customerId,
            filterOptions,
            sortOptions,
            paginationOptions,
        });
    }
    /**
     * List branch global (lintas customer) untuk tabel Branch mandiri.
     * `customerId` bersifat filter opsional — divalidasi bila diisi.
     */
    async findMany({ customerId, filterOptions, sortOptions, paginationOptions, }) {
        if (customerId != null) {
            await this.assertCustomerExists(customerId);
        }
        return this.branchRepository.findMany({
            customerId,
            filterOptions,
            sortOptions,
            paginationOptions,
        });
    }
    async countMany(customerId, filterOptions) {
        if (customerId != null) {
            await this.assertCustomerExists(customerId);
        }
        return this.branchRepository.countMany(customerId, filterOptions);
    }
    async assertCustomerExists(customerId) {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    customer: "customerNotExists",
                },
            });
        }
    }
    async countByCustomerId(customerId, filterOptions) {
        return this.branchRepository.countByCustomerId(customerId, filterOptions);
    }
    async findBranchById(id) {
        return this.branchRepository.findById(id);
    }
    async update(id, updateBranchDto) {
        const branch = await this.branchRepository.findById(id);
        if (!branch) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    branch: "branchNotExists",
                },
            });
        }
        if (updateBranchDto.provinceId !== undefined ||
            updateBranchDto.cityId !== undefined) {
            const provinceId = updateBranchDto.provinceId ?? branch.provinceId;
            const cityId = updateBranchDto.cityId ?? branch.cityId;
            await this.regionValidation.assertRegionPair(provinceId, cityId);
        }
        if (updateBranchDto.isHeadOffice && !branch.isHeadOffice) {
            await this.assertHeadOfficeAvailable(branch.customerId);
        }
        const updated = await this.branchRepository.update(id, {
            ...updateBranchDto,
        });
        if (!updated) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    branch: "branchNotExists",
                },
            });
        }
        return updated;
    }
    async remove(id) {
        const branch = await this.branchRepository.findById(id);
        if (!branch) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    branch: "branchNotExists",
                },
            });
        }
        try {
            // staff.branchId is FK RESTRICT — the DB owns referential integrity.
            await this.branchRepository.remove(id);
        }
        catch (error) {
            if (error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "23503") {
                throw new common_1.UnprocessableEntityException({
                    status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        branch: "branchHasStaff",
                    },
                });
            }
            throw error;
        }
    }
    /**
     * Friendly pre-check for the max-1-head-office rule. The partial unique
     * index `UQ_branch_headOffice` is the hard guarantee; this only surfaces a
     * readable error instead of a constraint violation.
     */
    async assertHeadOfficeAvailable(customerId) {
        const headOffice = await this.branchRepository.findHeadOfficeByCustomerId(customerId);
        if (headOffice) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    isHeadOffice: "customerAlreadyHasHeadOffice",
                },
            });
        }
    }
};
exports.BranchService = BranchService;
exports.BranchService = BranchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [branch_repository_1.BranchRepository,
        customer_repository_1.CustomerRepository,
        region_validation_service_1.RegionValidationService])
], BranchService);
