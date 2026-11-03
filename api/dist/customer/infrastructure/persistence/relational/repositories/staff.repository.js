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
    async create(data) {
        const persistenceModel = staff_mapper_1.StaffMapper.toPersistence(data);
        const newEntity = await this.staffRepository.save(this.staffRepository.create(persistenceModel));
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
            }), { name: 'ASC' }),
        });
        return entities.map((staff) => staff_mapper_1.StaffMapper.toDomain(staff));
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
        const updatedEntity = await this.staffRepository.save(this.staffRepository.create(staff_mapper_1.StaffMapper.toPersistence({
            ...staff_mapper_1.StaffMapper.toDomain(entity),
            ...payload,
        })));
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
