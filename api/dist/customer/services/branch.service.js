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
exports.BranchService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const customer_repository_1 = require("../infrastructure/persistence/customer.repository");
const branch_repository_1 = require("../infrastructure/persistence/branch.repository");
const region_validation_service_1 = require("./region-validation.service");
const staff_repository_1 = require("../infrastructure/persistence/staff.repository");
const customer_options_1 = require("../customer.options");
let BranchService = class BranchService {
    constructor(branchRepository, customerRepository, regionValidation, staffRepository, moduleOptions) {
        this.branchRepository = branchRepository;
        this.customerRepository = customerRepository;
        this.regionValidation = regionValidation;
        this.staffRepository = staffRepository;
        this.moduleOptions = moduleOptions;
    }
    async create(customerId, createBranchDto, actorUserId) {
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
        const createLoginAccount = this.moduleOptions?.createLoginAccount;
        const deleteLoginAccount = this.moduleOptions?.deleteLoginAccount;
        const transaction = this.moduleOptions?.transaction;
        const recordBranchCreated = this.moduleOptions?.recordBranchCreated;
        if (!createLoginAccount ||
            !deleteLoginAccount ||
            !transaction ||
            !recordBranchCreated) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: { account: "accountProvisioningUnavailable" },
            });
        }
        let accountId = null;
        const correlationId = (0, node_crypto_1.randomUUID)();
        try {
            // Reserve the database-generated id before calling the external account
            // service. This keeps network work outside the PostgreSQL transaction
            // while allowing the account's branch scope to use its final id.
            const branchId = await this.branchRepository.reserveId();
            const account = await createLoginAccount({
                email: createBranchDto.adminEmail,
                password: createBranchDto.adminPassword,
                name: createBranchDto.adminName,
                roleKey: "customer-branch-admin",
                scopeType: "branch",
                scopeId: String(branchId),
                assignedBy: actorUserId,
            });
            accountId = account.id;
            return await transaction(async (manager) => {
                // Branch, Staff and outbox are committed or rolled back together.
                const branch = await this.branchRepository.create({
                    customerId,
                    name: createBranchDto.name,
                    isHeadOffice: createBranchDto.isHeadOffice ?? false,
                    addressLine: createBranchDto.addressLine,
                    provinceId: createBranchDto.provinceId,
                    cityId: createBranchDto.cityId,
                    postalCode: createBranchDto.postalCode ?? null,
                    vatNumber: createBranchDto.vatNumber ?? null,
                    vatType: createBranchDto.vatType ?? "npwp",
                    isActive: createBranchDto.isActive ?? true,
                }, manager, branchId);
                await this.staffRepository.create({
                    branchId: branch.id,
                    name: createBranchDto.adminName,
                    userId: account.id,
                    position: "Branch Administrator",
                    phone: null,
                    email: createBranchDto.adminEmail.trim().toLowerCase(),
                    nip: null,
                    addressLine: null,
                    provinceId: null,
                    cityId: null,
                    photoId: null,
                    isActive: true,
                }, manager);
                await recordBranchCreated(manager, {
                    entityId: String(branch.id),
                    actorUserId,
                    correlationId,
                    data: {
                        id: branch.id,
                        customerId: branch.customerId,
                        name: branch.name,
                        code: branch.code ?? null,
                        isHeadOffice: branch.isHeadOffice,
                        isActive: branch.isActive,
                    },
                });
                return branch;
            });
        }
        catch (error) {
            // The database transaction has rolled back before this compensation.
            if (accountId !== null) {
                try {
                    await deleteLoginAccount(accountId);
                }
                catch (cleanupError) {
                    throw new AggregateError([error, cleanupError], "Branch creation rolled back but account compensation failed");
                }
            }
            throw error;
        }
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
    async findMany({ customerId, filterOptions, sortOptions, paginationOptions, scope, }) {
        if (customerId != null) {
            await this.assertCustomerExists(customerId);
        }
        return this.branchRepository.findMany({
            customerId,
            filterOptions,
            sortOptions,
            paginationOptions,
            scope,
        });
    }
    async countMany(customerId, filterOptions, scope) {
        if (customerId != null) {
            await this.assertCustomerExists(customerId);
        }
        return this.branchRepository.countMany(customerId, filterOptions, scope);
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
        const transaction = this.moduleOptions?.transaction;
        const recordBranchUpdated = this.moduleOptions?.recordBranchUpdated;
        if (!transaction || !recordBranchUpdated) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: { lifecycle: "branchLifecycleUnavailable" },
            });
        }
        return transaction(async (manager) => {
            // Read and lock the snapshot in the same transaction as update + outbox.
            const branch = await this.branchRepository.findById(id, manager);
            if (!branch) {
                throw new common_1.UnprocessableEntityException({
                    status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: { branch: "branchNotExists" },
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
            const updated = await this.branchRepository.update(id, { ...updateBranchDto }, manager);
            if (!updated) {
                throw new common_1.UnprocessableEntityException({
                    status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: { branch: "branchNotExists" },
                });
            }
            await recordBranchUpdated(manager, {
                entityId: String(updated.id),
                correlationId: (0, node_crypto_1.randomUUID)(),
                data: {
                    id: updated.id,
                    customerId: updated.customerId,
                    name: updated.name,
                    code: updated.code ?? null,
                    isHeadOffice: updated.isHeadOffice,
                    isActive: updated.isActive,
                },
            });
            return updated;
        });
    }
    async remove(id) {
        const transaction = this.moduleOptions?.transaction;
        const recordBranchDeleted = this.moduleOptions?.recordBranchDeleted;
        if (!transaction || !recordBranchDeleted) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: { lifecycle: "branchLifecycleUnavailable" },
            });
        }
        try {
            await transaction(async (manager) => {
                // Lock and snapshot the row before deletion; subscribers never need
                // to query a row that no longer exists.
                const branch = await this.branchRepository.findById(id, manager);
                if (!branch) {
                    throw new common_1.UnprocessableEntityException({
                        status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                        errors: { branch: "branchNotExists" },
                    });
                }
                await this.branchRepository.remove(id, manager);
                await recordBranchDeleted(manager, {
                    entityId: String(branch.id),
                    correlationId: (0, node_crypto_1.randomUUID)(),
                    data: {
                        id: branch.id,
                        customerId: branch.customerId,
                        name: branch.name,
                        code: branch.code ?? null,
                        isHeadOffice: branch.isHeadOffice,
                        isActive: branch.isActive,
                    },
                });
            });
        }
        catch (error) {
            if (error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "23503") {
                throw new common_1.UnprocessableEntityException({
                    status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: { branch: "branchHasStaff" },
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
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, common_1.Inject)(customer_options_1.CUSTOMER_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [branch_repository_1.BranchRepository,
        customer_repository_1.CustomerRepository,
        region_validation_service_1.RegionValidationService,
        staff_repository_1.StaffRepository, Object])
], BranchService);
