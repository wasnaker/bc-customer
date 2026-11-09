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
exports.BranchesRelationalRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const branch_entity_1 = require("../entities/branch.entity");
const branch_mapper_1 = require("../mappers/branch.mapper");
let BranchesRelationalRepository = class BranchesRelationalRepository {
    constructor(branchRepository) {
        this.branchRepository = branchRepository;
    }
    async reserveId() {
        const rows = await this.branchRepository.query("SELECT nextval(pg_get_serial_sequence('branch', 'id')) AS id");
        if (!rows[0]?.id) {
            throw new Error("Unable to reserve Branch id from PostgreSQL sequence");
        }
        return String(rows[0].id);
    }
    async create(data, manager, id) {
        const repository = manager
            ? manager.getRepository(branch_entity_1.BranchEntity)
            : this.branchRepository;
        const persistenceModel = branch_mapper_1.BranchMapper.toPersistence(data);
        const entityInput = {
            ...persistenceModel,
            ...(id != null ? { id: BigInt(id) } : {}),
        };
        const newEntity = await repository.save(repository.create(entityInput));
        // Kolom `code` diisi oleh trigger AFTER INSERT di database, sehingga tidak
        // terbawa oleh nilai kembalian save(). Baca ulang baris untuk memuatnya.
        const savedEntity = await repository.findOneByOrFail({
            id: newEntity.id,
        });
        return branch_mapper_1.BranchMapper.toDomain(savedEntity);
    }
    async findManyByCustomerId({ customerId, filterOptions, sortOptions, paginationOptions, }) {
        const where = {
            customerId: BigInt(customerId),
        };
        if (filterOptions?.name) {
            where.name = (0, typeorm_2.ILike)(`%${filterOptions.name}%`);
        }
        if (filterOptions?.isHeadOffice !== undefined) {
            where.isHeadOffice = filterOptions.isHeadOffice;
        }
        const entities = await this.branchRepository.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where,
            order: sortOptions?.reduce((accumulator, sort) => ({
                ...accumulator,
                [sort.orderBy]: sort.order,
            }), { isHeadOffice: "DESC", name: "ASC" }),
        });
        return entities.map((branch) => branch_mapper_1.BranchMapper.toDomain(branch));
    }
    async findMany({ customerId, filterOptions, sortOptions, paginationOptions, scope, }) {
        const baseWhere = {};
        if (customerId != null) {
            baseWhere.customerId = BigInt(customerId);
        }
        if (filterOptions?.name) {
            baseWhere.name = (0, typeorm_2.ILike)(`%${filterOptions.name}%`);
        }
        if (filterOptions?.isHeadOffice !== undefined) {
            baseWhere.isHeadOffice = filterOptions.isHeadOffice;
        }
        let where = baseWhere;
        if (scope && !scope.global) {
            const scopedWhere = [];
            if (scope.customerIds.length > 0 &&
                (customerId == null || scope.customerIds.includes(String(customerId)))) {
                scopedWhere.push({
                    ...baseWhere,
                    customerId: customerId != null
                        ? BigInt(customerId)
                        : (0, typeorm_2.In)(scope.customerIds.map((id) => BigInt(id))),
                });
            }
            if (scope.branchIds.length > 0) {
                scopedWhere.push({
                    ...baseWhere,
                    ...(customerId != null ? { customerId: BigInt(customerId) } : {}),
                    id: (0, typeorm_2.In)(scope.branchIds.map((id) => BigInt(id))),
                });
            }
            if (scopedWhere.length === 0)
                return [];
            where = scopedWhere;
        }
        const entities = await this.branchRepository.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where,
            // Relasi customer+staff hanya untuk list global — nama customer dan
            // email admin (via staff) dibutuhkan tabel Branch mandiri.
            relations: customerId == null ? { customer: true, staff: true } : undefined,
            order: sortOptions?.reduce((accumulator, sort) => ({
                ...accumulator,
                [sort.orderBy]: sort.order,
            }), { isHeadOffice: "DESC", name: "ASC" }),
        });
        return entities.map((branch) => branch_mapper_1.BranchMapper.toDomain(branch));
    }
    async countMany(customerId, filterOptions, scope) {
        const baseWhere = {};
        if (customerId != null) {
            baseWhere.customerId = BigInt(customerId);
        }
        if (filterOptions?.name) {
            baseWhere.name = (0, typeorm_2.ILike)(`%${filterOptions.name}%`);
        }
        if (filterOptions?.isHeadOffice !== undefined) {
            baseWhere.isHeadOffice = filterOptions.isHeadOffice;
        }
        let where = baseWhere;
        if (scope && !scope.global) {
            const scopedWhere = [];
            if (scope.customerIds.length > 0 &&
                (customerId == null || scope.customerIds.includes(String(customerId)))) {
                scopedWhere.push({
                    ...baseWhere,
                    customerId: customerId != null
                        ? BigInt(customerId)
                        : (0, typeorm_2.In)(scope.customerIds.map((id) => BigInt(id))),
                });
            }
            if (scope.branchIds.length > 0) {
                scopedWhere.push({
                    ...baseWhere,
                    id: (0, typeorm_2.In)(scope.branchIds.map((id) => BigInt(id))),
                });
            }
            if (scopedWhere.length === 0)
                return 0;
            where = scopedWhere;
        }
        return this.branchRepository.count({ where });
    }
    async findById(id, manager) {
        const repository = manager
            ? manager.getRepository(branch_entity_1.BranchEntity)
            : this.branchRepository;
        const entity = await repository.findOne({
            where: { id: BigInt(id) },
            ...(manager ? { lock: { mode: "pessimistic_write" } } : {}),
        });
        return entity ? branch_mapper_1.BranchMapper.toDomain(entity) : null;
    }
    async findHeadOfficeByCustomerId(customerId) {
        const entity = await this.branchRepository.findOne({
            where: { customerId: BigInt(customerId), isHeadOffice: true },
        });
        return entity ? branch_mapper_1.BranchMapper.toDomain(entity) : null;
    }
    async countByCustomerId(customerId, filterOptions) {
        const where = {
            customerId: BigInt(customerId),
        };
        if (filterOptions?.name) {
            where.name = (0, typeorm_2.ILike)(`%${filterOptions.name}%`);
        }
        if (filterOptions?.isHeadOffice !== undefined) {
            where.isHeadOffice = filterOptions.isHeadOffice;
        }
        return this.branchRepository.count({ where });
    }
    async update(id, payload, manager) {
        const repository = manager
            ? manager.getRepository(branch_entity_1.BranchEntity)
            : this.branchRepository;
        const entity = await repository.findOne({
            where: { id: BigInt(id) },
        });
        if (!entity) {
            return null;
        }
        // TypeORM memperlakukan id berupa BigInt sebagai "tanpa id" pada
        // save() (entitas dianggap baru -> INSERT). Gunakan update() + baca ulang.
        const persistenceModel = branch_mapper_1.BranchMapper.toPersistence({
            ...branch_mapper_1.BranchMapper.toDomain(entity),
            ...payload,
        });
        delete persistenceModel.id; // tidak boleh masuk klausa SET
        delete persistenceModel.ulid; // immutable
        delete persistenceModel.code; // diisi trigger AFTER INSERT
        await repository.update({ id: BigInt(id) }, persistenceModel);
        const updatedEntity = await repository.findOneByOrFail({
            id: BigInt(id),
        });
        return branch_mapper_1.BranchMapper.toDomain(updatedEntity);
    }
    async remove(id, manager) {
        const repository = manager
            ? manager.getRepository(branch_entity_1.BranchEntity)
            : this.branchRepository;
        await repository.delete({ id: BigInt(id) });
    }
};
exports.BranchesRelationalRepository = BranchesRelationalRepository;
exports.BranchesRelationalRepository = BranchesRelationalRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_entity_1.BranchEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BranchesRelationalRepository);
