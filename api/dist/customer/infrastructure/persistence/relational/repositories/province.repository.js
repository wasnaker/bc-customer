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
exports.ProvincesRelationalRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const province_entity_1 = require("../entities/province.entity");
const province_mapper_1 = require("../mappers/province.mapper");
let ProvincesRelationalRepository = class ProvincesRelationalRepository {
    constructor(provinceRepository) {
        this.provinceRepository = provinceRepository;
    }
    async create(data) {
        const persistenceModel = province_mapper_1.ProvinceMapper.toPersistence(data);
        const newEntity = await this.provinceRepository.save(this.provinceRepository.create(persistenceModel));
        return province_mapper_1.ProvinceMapper.toDomain(newEntity);
    }
    async findManyWithPagination({ filterOptions, sortOptions, paginationOptions, }) {
        const search = filterOptions?.search?.trim();
        // OR-search across the fields exposed by the province list table.
        const where = search
            ? [
                { name: (0, typeorm_2.ILike)(`%${search}%`) },
                { isoCode: (0, typeorm_2.ILike)(`%${search}%`) },
            ]
            : [{}];
        const entities = await this.provinceRepository.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where,
            order: sortOptions?.reduce((accumulator, sort) => ({
                ...accumulator,
                [sort.orderBy]: sort.order,
            }), { name: 'ASC' }),
        });
        return entities.map((province) => province_mapper_1.ProvinceMapper.toDomain(province));
    }
    async findAll() {
        const entities = await this.provinceRepository.find({ order: { name: 'ASC' } });
        return entities.map((province) => province_mapper_1.ProvinceMapper.toDomain(province));
    }
    async findById(id) {
        const entity = await this.provinceRepository.findOne({
            where: { id: Number(id) },
        });
        return entity ? province_mapper_1.ProvinceMapper.toDomain(entity) : null;
    }
    async findByName(name) {
        const entity = await this.provinceRepository.findOne({
            where: { name },
        });
        return entity ? province_mapper_1.ProvinceMapper.toDomain(entity) : null;
    }
    async findByIsoCode(isoCode) {
        if (!isoCode)
            return null;
        const entity = await this.provinceRepository.findOne({ where: { isoCode } });
        return entity ? province_mapper_1.ProvinceMapper.toDomain(entity) : null;
    }
    async countAll() {
        return this.provinceRepository.count();
    }
    async countWithFilter(filterOptions) {
        const search = filterOptions?.search?.trim();
        if (!search) {
            return this.provinceRepository.count();
        }
        return this.provinceRepository.count({
            where: [
                { name: (0, typeorm_2.ILike)(`%${search}%`) },
                { isoCode: (0, typeorm_2.ILike)(`%${search}%`) },
            ],
        });
    }
    async update(id, payload) {
        const entity = await this.provinceRepository.findOne({
            where: { id: Number(id) },
        });
        if (!entity) {
            throw new Error('Province not found');
        }
        const updatedEntity = await this.provinceRepository.save(this.provinceRepository.create(province_mapper_1.ProvinceMapper.toPersistence({
            ...province_mapper_1.ProvinceMapper.toDomain(entity),
            ...payload,
        })));
        return province_mapper_1.ProvinceMapper.toDomain(updatedEntity);
    }
    async remove(id) {
        await this.provinceRepository.delete(Number(id));
    }
};
exports.ProvincesRelationalRepository = ProvincesRelationalRepository;
exports.ProvincesRelationalRepository = ProvincesRelationalRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(province_entity_1.ProvinceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProvincesRelationalRepository);
