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
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const branch_repository_1 = require("../infrastructure/persistence/branch.repository");
const customer_repository_1 = require("../infrastructure/persistence/customer.repository");
const staff_repository_1 = require("../infrastructure/persistence/staff.repository");
const region_validation_service_1 = require("./region-validation.service");
const customer_options_1 = require("../customer.options");
const customer_core_account_provisioning_client_1 = require("../customer-core-account-provisioning.client");
const customer_core_user_directory_client_1 = require("../customer-core-user-directory.client");
let StaffService = class StaffService {
    constructor(staffRepository, branchRepository, customerRepository, regionValidation, moduleOptions, coreUsers, accountProvisioning) {
        this.staffRepository = staffRepository;
        this.branchRepository = branchRepository;
        this.customerRepository = customerRepository;
        this.regionValidation = regionValidation;
        this.moduleOptions = moduleOptions;
        this.coreUsers = coreUsers;
        this.accountProvisioning = accountProvisioning;
    }
    async create(branchId, createStaffDto, actorUserId) {
        const branch = await this.branchRepository.findById(branchId);
        if (!branch) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    branch: "branchNotExists",
                },
            });
        }
        if (!this.accountProvisioning) {
            throw new common_1.UnprocessableEntityException({ status: common_1.HttpStatus.UNPROCESSABLE_ENTITY, errors: { account: "accountProvisioningUnavailable" } });
        }
        if (createStaffDto.provinceId !== undefined &&
            createStaffDto.provinceId !== null &&
            createStaffDto.cityId !== undefined &&
            createStaffDto.cityId !== null) {
            await this.regionValidation.assertRegionPair(createStaffDto.provinceId, createStaffDto.cityId);
        }
        const account = await this.accountProvisioning.create({
            email: createStaffDto.email, password: createStaffDto.password, name: createStaffDto.name,
            roleKey: "customer", scopeType: "branch", scopeId: String(branch.id), assignedBy: actorUserId,
        });
        try {
            return await this.staffRepository.create({
                branchId, name: createStaffDto.name, userId: account.id,
                position: createStaffDto.position ?? null, phone: createStaffDto.phone ?? null,
                email: createStaffDto.email.trim().toLowerCase(), nip: createStaffDto.nip ?? null,
                addressLine: createStaffDto.addressLine ?? null, provinceId: createStaffDto.provinceId ?? null,
                cityId: createStaffDto.cityId ?? null, photoId: createStaffDto.photoId ?? null,
                isActive: createStaffDto.isActive ?? true,
            });
        }
        catch (error) {
            await this.accountProvisioning.remove(account.id);
            throw error;
        }
    }
    async findManyByBranchId({ branchId, filterOptions, sortOptions, paginationOptions, }) {
        const branch = await this.branchRepository.findById(branchId);
        if (!branch) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    branch: "branchNotExists",
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
    /**
     * List staff global (lintas branch) untuk tabel Staff mandiri.
     * `branchId` bersifat filter opsional — divalidasi bila diisi.
     */
    async findMany({ branchId, customerId, filterOptions, sortOptions, paginationOptions, scope, }) {
        if (branchId != null) {
            await this.assertBranchExists(branchId);
        }
        else if (customerId != null) {
            await this.assertCustomerExists(customerId);
        }
        return this.staffRepository.findMany({
            branchId,
            customerId,
            filterOptions,
            sortOptions,
            paginationOptions,
            scope,
        });
    }
    async countMany(branchId, filterOptions, customerId, scope) {
        if (branchId != null) {
            await this.assertBranchExists(branchId);
        }
        else if (customerId != null) {
            await this.assertCustomerExists(customerId);
        }
        return this.staffRepository.countMany(branchId, filterOptions, customerId, scope);
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
    async assertBranchExists(branchId) {
        const branch = await this.branchRepository.findById(branchId);
        if (!branch) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    branch: "branchNotExists",
                },
            });
        }
    }
    async findStaffById(id) {
        return this.staffRepository.findById(id);
    }
    /** Resolve the signed-in host account to its single linked staff record. */
    async findStaffByUserId(userId) {
        if (this.coreUsers && !(await this.coreUsers.findById(userId)))
            return null;
        return this.staffRepository.findByUserId(userId);
    }
    async update(id, updateStaffDto) {
        const staff = await this.staffRepository.findById(id);
        if (!staff) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    staff: "staffNotExists",
                },
            });
        }
        if (updateStaffDto.email !== undefined && updateStaffDto.email !== staff.email) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: { email: "staffLoginEmailImmutable" },
            });
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
                    staff: "staffNotExists",
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
                    staff: "staffNotExists",
                },
            });
        }
        await this.staffRepository.remove(id);
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, common_1.Inject)(customer_options_1.CUSTOMER_MODULE_OPTIONS)),
    __param(5, (0, common_1.Optional)()),
    __param(6, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [staff_repository_1.StaffRepository,
        branch_repository_1.BranchRepository,
        customer_repository_1.CustomerRepository,
        region_validation_service_1.RegionValidationService, Object, customer_core_user_directory_client_1.CustomerCoreUserDirectoryClient,
        customer_core_account_provisioning_client_1.CustomerCoreAccountProvisioningClient])
], StaffService);
