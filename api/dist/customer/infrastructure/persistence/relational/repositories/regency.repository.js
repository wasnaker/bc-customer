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
exports.RegenciesRelationalRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const regency_entity_1 = require("../entities/regency.entity");
const regency_mapper_1 = require("../mappers/regency.mapper");
let RegenciesRelationalRepository = class RegenciesRelationalRepository {
    constructor(regencyRepository) {
        this.regencyRepository = regencyRepository;
    }
    async create(data) {
        const persistenceModel = regency_mapper_1.RegencyMapper.toPersistence(data);
        const newEntity = await this.regencyRepository.save(this.regencyRepository.create(persistenceModel));
        return regency_mapper_1.RegencyMapper.toDomain(newEntity);
    }
    async findManyWithPagination({ filterOptions, sortOptions, paginationOptions, }) {
        const where = this.buildWhere(filterOptions);
        const entities = await this.regencyRepository.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where,
            order: sortOptions?.reduce((accumulator, sort) => ({
                ...accumulator,
                [sort.orderBy]: sort.order,
            }), { name: 'ASC' }),
        });
        return entities.map((regency) => regency_mapper_1.RegencyMapper.toDomain(regency));
    }
    async findAll() {
        const entities = await this.regencyRepository.find({ order: { name: 'ASC' } });
        return entities.map((regency) => regency_mapper_1.RegencyMapper.toDomain(regency));
    }
    async findById(id) {
        const entity = await this.regencyRepository.findOne({
            where: { id: Number(id) },
        });
        return entity ? regency_mapper_1.RegencyMapper.toDomain(entity) : null;
    }
    async findByProvinceId(provinceId) {
        const entities = await this.regencyRepository.find({
            where: { provinceId: Number(provinceId) },
            order: { name: 'ASC' },
        });
        return entities.map((regency) => regency_mapper_1.RegencyMapper.toDomain(regency));
    }
    async findByProvinceIdAndName(provinceId, name) {
        const entity = await this.regencyRepository.findOne({
            where: { provinceId: Number(provinceId), name },
        });
        return entity ? regency_mapper_1.RegencyMapper.toDomain(entity) : null;
    }
    async countByProvinceId(provinceId) {
        return this.regencyRepository.count({
            where: { provinceId: Number(provinceId) },
        });
    }
    async countAll() {
        return this.regencyRepository.count();
    }
    async countWithFilter(filterOptions) {
        const where = {};
        if (filterOptions?.provinceId !== undefined && filterOptions.provinceId !== null) {
            where.provinceId = Number(filterOptions.provinceId);
        }
        if (filterOptions?.type) {
            where.type = filterOptions.type;
        }
        return this.regencyRepository.count({ where });
    }
    async update(id, payload) {
        const entity = await this.regencyRepository.findOne({
            where: { id: Number(id) },
        });
        if (!entity) {
            throw new Error('Regency not found');
        }
        const updatedEntity = await this.regencyRepository.save(this.regencyRepository.create(regency_mapper_1.RegencyMapper.toPersistence({
            ...regency_mapper_1.RegencyMapper.toDomain(entity),
            ...payload,
        })));
        return regency_mapper_1.RegencyMapper.toDomain(updatedEntity);
    }
    async remove(id) {
        await this.regencyRepository.delete(Number(id));
    }
    async removeByProvinceId(provinceId) {
        await this.regencyRepository.delete({ provinceId: Number(provinceId) });
    }
    buildWhere(filterOptions) {
        const where = {};
        if (filterOptions?.provinceId !== undefined && filterOptions.provinceId !== null) {
            where.provinceId = Number(filterOptions.provinceId);
        }
        if (filterOptions?.type) {
            where.type = filterOptions.type;
        }
        return where;
    }
};
exports.RegenciesRelationalRepository = RegenciesRelationalRepository;
exports.RegenciesRelationalRepository = RegenciesRelationalRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(regency_entity_1.RegencyEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RegenciesRelationalRepository);
