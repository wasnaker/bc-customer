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
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const branch_repository_1 = require("../infrastructure/persistence/branch.repository");
const staff_repository_1 = require("../infrastructure/persistence/staff.repository");
const region_validation_service_1 = require("./region-validation.service");
let StaffService = class StaffService {
    constructor(staffRepository, branchRepository, regionValidation) {
        this.staffRepository = staffRepository;
        this.branchRepository = branchRepository;
        this.regionValidation = regionValidation;
    }
    async create(branchId, createStaffDto) {
        const branch = await this.branchRepository.findById(branchId);
        if (!branch) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    branch: 'branchNotExists',
                },
            });
        }
        if (createStaffDto.userId !== undefined && createStaffDto.userId !== null) {
            await this.assertUserNotLinked(createStaffDto.userId);
        }
        if (createStaffDto.provinceId !== undefined &&
            createStaffDto.provinceId !== null &&
            createStaffDto.cityId !== undefined &&
            createStaffDto.cityId !== null) {
            await this.regionValidation.assertRegionPair(createStaffDto.provinceId, createStaffDto.cityId);
        }
        return this.staffRepository.create({
            branchId,
            name: createStaffDto.name,
            userId: createStaffDto.userId ?? null,
            position: createStaffDto.position ?? null,
            phone: createStaffDto.phone ?? null,
            email: createStaffDto.email ?? null,
            nip: createStaffDto.nip ?? null,
            addressLine: createStaffDto.addressLine ?? null,
            provinceId: createStaffDto.provinceId ?? null,
            cityId: createStaffDto.cityId ?? null,
            photoId: createStaffDto.photoId ?? null,
            isActive: createStaffDto.isActive ?? true,
        });
    }
    async findManyByBranchId({ branchId, filterOptions, sortOptions, paginationOptions, }) {
        const branch = await this.branchRepository.findById(branchId);
        if (!branch) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    branch: 'branchNotExists',
                },
            });
        }
        return this.staffRepository.findManyByBranchId({
            branchId,
            filterOptions,
            sortOptions,
            paginationOptions,
        });
    }
    async countByBranchId(branchId, filterOptions) {
        return this.staffRepository.countByBranchId(branchId, filterOptions);
    }
    async findStaffById(id) {
        return this.staffRepository.findById(id);
    }
    async update(id, updateStaffDto) {
        const staff = await this.staffRepository.findById(id);
        if (!staff) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    staff: 'staffNotExists',
                },
            });
        }
        if (updateStaffDto.userId !== undefined &&
            updateStaffDto.userId !== null &&
            updateStaffDto.userId !== staff.userId) {
            await this.assertUserNotLinked(updateStaffDto.userId);
        }
        if (updateStaffDto.provinceId !== undefined ||
            updateStaffDto.cityId !== undefined) {
            const provinceId = updateStaffDto.provinceId ?? staff.provinceId;
            const cityId = updateStaffDto.cityId ?? staff.cityId;
            if (provinceId !== null && cityId !== null) {
                await this.regionValidation.assertRegionPair(provinceId, cityId);
            }
        }
        const updated = await this.staffRepository.update(id, {
            ...updateStaffDto,
        });
        if (!updated) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    staff: 'staffNotExists',
                },
            });
        }
        return updated;
    }
    async remove(id) {
        const staff = await this.staffRepository.findById(id);
        if (!staff) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    staff: 'staffNotExists',
                },
            });
        }
        await this.staffRepository.remove(id);
    }
    /**
     * Friendly pre-check for the one-user-one-staff rule. The unique index
     * `UQ_staff_userId` is the hard guarantee.
     */
    async assertUserNotLinked(userId) {
        const existing = await this.staffRepository.findByUserId(userId);
        if (existing) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    userId: 'staffUserAlreadyLinked',
                },
            });
        }
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [staff_repository_1.StaffRepository,
        branch_repository_1.BranchRepository,
        region_validation_service_1.RegionValidationService])
], StaffService);
