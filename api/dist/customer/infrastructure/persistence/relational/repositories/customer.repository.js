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
exports.CustomersRelationalRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../entities/customer.entity");
const customer_mapper_1 = require("../mappers/customer.mapper");
let CustomersRelationalRepository = class CustomersRelationalRepository {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async create(data) {
        const persistenceModel = customer_mapper_1.CustomerMapper.toPersistence(data);
        const newEntity = await this.customerRepository.save(this.customerRepository.create(persistenceModel));
        // Kolom `code` diisi oleh trigger AFTER INSERT di database, sehingga tidak
        // terbawa oleh nilai kembalian save(). Baca ulang baris untuk memuatnya.
        const savedEntity = await this.customerRepository.findOneByOrFail({
            id: newEntity.id,
        });
        return customer_mapper_1.CustomerMapper.toDomain(savedEntity);
    }
    async findManyWithPagination({ filterOptions, sortOptions, paginationOptions, }) {
        const where = {};
        if (filterOptions?.name) {
            where.name = (0, typeorm_2.ILike)(`%${filterOptions.name}%`);
        }
        if (filterOptions?.isActive !== undefined) {
            where.isActive = filterOptions.isActive;
        }
        const entities = await this.customerRepository.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where,
            order: sortOptions?.reduce((accumulator, sort) => ({
                ...accumulator,
                [sort.orderBy]: sort.order,
            }), { createdAt: 'DESC' }),
        });
        return entities.map((customer) => customer_mapper_1.CustomerMapper.toDomain(customer));
    }
    async findById(id) {
        const entity = await this.customerRepository.findOne({
            where: { id: BigInt(id) },
        });
        return entity ? customer_mapper_1.CustomerMapper.toDomain(entity) : null;
    }
    async findByName(name) {
        const entity = await this.customerRepository.findOne({
            where: { name },
        });
        return entity ? customer_mapper_1.CustomerMapper.toDomain(entity) : null;
    }
    async existsByName(name) {
        const count = await this.customerRepository.count({ where: { name } });
        return count > 0;
    }
    async countWithFilter(filterOptions) {
        const where = {};
        if (filterOptions?.name) {
            where.name = (0, typeorm_2.ILike)(`%${filterOptions.name}%`);
        }
        if (filterOptions?.isActive !== undefined) {
            where.isActive = filterOptions.isActive;
        }
        return this.customerRepository.count({ where });
    }
    async update(id, payload) {
        const entity = await this.customerRepository.findOne({
            where: { id: BigInt(id) },
        });
        if (!entity) {
            return null;
        }
        const updatedEntity = await this.customerRepository.save(this.customerRepository.create(customer_mapper_1.CustomerMapper.toPersistence({
            ...customer_mapper_1.CustomerMapper.toDomain(entity),
            ...payload,
        })));
        return customer_mapper_1.CustomerMapper.toDomain(updatedEntity);
    }
    async remove(id) {
        await this.customerRepository.delete({ id: BigInt(id) });
    }
};
exports.CustomersRelationalRepository = CustomersRelationalRepository;
exports.CustomersRelationalRepository = CustomersRelationalRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.CustomerEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomersRelationalRepository);
