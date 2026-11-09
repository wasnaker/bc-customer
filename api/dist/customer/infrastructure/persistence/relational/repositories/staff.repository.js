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
exports.StaffRelationalRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const staff_entity_1 = require("../entities/staff.entity");
const staff_mapper_1 = require("../mappers/staff.mapper");
let StaffRelationalRepository = class StaffRelationalRepository {
    constructor(staffRepository) {
        this.staffRepository = staffRepository;
    }
    async create(data, manager) {
        const repository = manager
            ? manager.getRepository(staff_entity_1.StaffEntity)
            : this.staffRepository;
        const persistenceModel = staff_mapper_1.StaffMapper.toPersistence(data);
        const newEntity = await repository.save(repository.create(persistenceModel));
        return staff_mapper_1.StaffMapper.toDomain(newEntity);
    }
    async findManyByBranchId({ branchId, filterOptions, sortOptions, paginationOptions, }) {
        const where = {
            branchId: BigInt(branchId),
        };
        if (filterOptions?.name) {
            where.name = (0, typeorm_2.ILike)(`%${filterOptions.name}%`);
        }
        if (filterOptions?.position) {
            where.position = (0, typeorm_2.ILike)(`%${filterOptions.position}%`);
        }
        const entities = await this.staffRepository.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where,
            order: sortOptions?.reduce((accumulator, sort) => ({
                ...accumulator,
                [sort.orderBy]: sort.order,
            }), { name: "ASC" }),
        });
        return entities.map((staff) => staff_mapper_1.StaffMapper.toDomain(staff));
    }
    async findMany({ branchId, customerId, filterOptions, sortOptions, paginationOptions, scope, }) {
        const baseWhere = {};
        if (branchId != null) {
            baseWhere.branchId = BigInt(branchId);
        }
        else if (customerId != null) {
            // Filter nested via relasi branch → customer.
            baseWhere.branch = { customerId: BigInt(customerId) };
        }
        if (filterOptions?.name) {
            baseWhere.name = (0, typeorm_2.ILike)(`%${filterOptions.name}%`);
        }
        if (filterOptions?.position) {
            baseWhere.position = (0, typeorm_2.ILike)(`%${filterOptions.position}%`);
        }
        let where = baseWhere;
        if (scope && !scope.global) {
            const scopedWhere = [];
            const allowedCustomers = new Set(scope.customerIds);
            if (scope.customerIds.length > 0 &&
                (customerId == null || allowedCustomers.has(String(customerId)))) {
                scopedWhere.push({
                    ...baseWhere,
                    branch: {
                        ...baseWhere.branch,
                        customerId: customerId != null
                            ? BigInt(customerId)
                            : (0, typeorm_2.In)(scope.customerIds.map((id) => BigInt(id))),
                    },
                });
            }
            if (scope.branchIds.length > 0 &&
                (branchId == null || scope.branchIds.includes(String(branchId)))) {
                scopedWhere.push({
                    ...baseWhere,
                    ...(customerId != null
                        ? { branch: { customerId: BigInt(customerId) } }
                        : {}),
                    branchId: branchId != null
                        ? BigInt(branchId)
                        : (0, typeorm_2.In)(scope.branchIds.map((id) => BigInt(id))),
                });
            }
            if (scopedWhere.length === 0)
                return [];
            where = scopedWhere;
        }
        const entities = await this.staffRepository.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where,
            // Relasi branch+customer hanya untuk list global — kolom nama
            // cabang/pelanggan dibutuhkan tabel Staff mandiri.
            relations: branchId == null ? { branch: { customer: true } } : undefined,
            order: sortOptions?.reduce((accumulator, sort) => ({
                ...accumulator,
                [sort.orderBy]: sort.order,
            }), { name: "ASC" }),
        });
        return entities.map((staff) => staff_mapper_1.StaffMapper.toDomain(staff));
    }
    async countMany(branchId, filterOptions, customerId, scope) {
        const baseWhere = {};
        if (branchId != null) {
            baseWhere.branchId = BigInt(branchId);
        }
        else if (customerId != null) {
            baseWhere.branch = { customerId: BigInt(customerId) };
        }
        if (filterOptions?.name) {
            baseWhere.name = (0, typeorm_2.ILike)(`%${filterOptions.name}%`);
        }
        if (filterOptions?.position) {
            baseWhere.position = (0, typeorm_2.ILike)(`%${filterOptions.position}%`);
        }
        let where = baseWhere;
        if (scope && !scope.global) {
            const scopedWhere = [];
            const allowedCustomers = new Set(scope.customerIds);
            if (scope.customerIds.length > 0 &&
                (customerId == null || allowedCustomers.has(String(customerId)))) {
                scopedWhere.push({
                    ...baseWhere,
                    branch: {
                        ...baseWhere.branch,
                        customerId: customerId != null
                            ? BigInt(customerId)
                            : (0, typeorm_2.In)(scope.customerIds.map((id) => BigInt(id))),
                    },
                });
            }
            if (scope.branchIds.length > 0 &&
                (branchId == null || scope.branchIds.includes(String(branchId)))) {
                scopedWhere.push({
                    ...baseWhere,
                    ...(customerId != null
                        ? { branch: { customerId: BigInt(customerId) } }
                        : {}),
                    branchId: branchId != null
                        ? BigInt(branchId)
                        : (0, typeorm_2.In)(scope.branchIds.map((id) => BigInt(id))),
                });
            }
            if (scopedWhere.length === 0)
                return 0;
            where = scopedWhere;
        }
        return this.staffRepository.count({ where });
    }
    async findById(id) {
        const entity = await this.staffRepository.findOne({
            where: { id: BigInt(id) },
        });
        return entity ? staff_mapper_1.StaffMapper.toDomain(entity) : null;
    }
    async findByUserId(userId) {
        const entity = await this.staffRepository.findOne({
            where: { userId },
        });
        return entity ? staff_mapper_1.StaffMapper.toDomain(entity) : null;
    }
    async countByBranchId(branchId, filterOptions) {
        const where = {
            branchId: BigInt(branchId),
        };
        if (filterOptions?.name) {
            where.name = (0, typeorm_2.ILike)(`%${filterOptions.name}%`);
        }
        if (filterOptions?.position) {
            where.position = (0, typeorm_2.ILike)(`%${filterOptions.position}%`);
        }
        return this.staffRepository.count({ where });
    }
    async update(id, payload) {
        const entity = await this.staffRepository.findOne({
            where: { id: BigInt(id) },
        });
        if (!entity) {
            return null;
        }
        // TypeORM memperlakukan id berupa BigInt sebagai "tanpa id" pada
        // save() (entitas dianggap baru -> INSERT). Gunakan update() + baca ulang.
        const persistenceModel = staff_mapper_1.StaffMapper.toPersistence({
            ...staff_mapper_1.StaffMapper.toDomain(entity),
            ...payload,
        });
        delete persistenceModel.id; // tidak boleh masuk klausa SET
        delete persistenceModel.ulid; // immutable
        await this.staffRepository.update({ id: BigInt(id) }, persistenceModel);
        const updatedEntity = await this.staffRepository.findOneByOrFail({
            id: BigInt(id),
        });
        return staff_mapper_1.StaffMapper.toDomain(updatedEntity);
    }
    async remove(id) {
        await this.staffRepository.delete({ id: BigInt(id) });
    }
};
exports.StaffRelationalRepository = StaffRelationalRepository;
exports.StaffRelationalRepository = StaffRelationalRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(staff_entity_1.StaffEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StaffRelationalRepository);
