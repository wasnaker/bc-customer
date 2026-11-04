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
exports.CustomerDocumentsRelationalRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_document_entity_1 = require("../entities/customer-document.entity");
const customer_document_mapper_1 = require("../mappers/customer-document.mapper");
let CustomerDocumentsRelationalRepository = class CustomerDocumentsRelationalRepository {
    constructor(customerDocumentRepository) {
        this.customerDocumentRepository = customerDocumentRepository;
    }
    async create(data) {
        const persistenceModel = customer_document_mapper_1.CustomerDocumentMapper.toPersistence(data);
        const newEntity = await this.customerDocumentRepository.save(this.customerDocumentRepository.create(persistenceModel));
        return customer_document_mapper_1.CustomerDocumentMapper.toDomain(newEntity);
    }
    async findManyByOwner({ ownerType, ownerId, filterOptions, sortOptions, paginationOptions, }) {
        const where = {
            ownerType,
            ownerId: BigInt(ownerId),
        };
        if (filterOptions?.type) {
            where.type = filterOptions.type;
        }
        const entities = await this.customerDocumentRepository.find({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where,
            order: sortOptions?.reduce((accumulator, sort) => ({
                ...accumulator,
                [sort.orderBy]: sort.order,
            }), { createdAt: 'DESC' }),
        });
        return entities.map((document) => customer_document_mapper_1.CustomerDocumentMapper.toDomain(document));
    }
    async findById(id) {
        const entity = await this.customerDocumentRepository.findOne({
            where: { id: BigInt(id) },
        });
        return entity ? customer_document_mapper_1.CustomerDocumentMapper.toDomain(entity) : null;
    }
    async countByOwner(ownerType, ownerId, filterOptions) {
        const where = {
            ownerType,
            ownerId: BigInt(ownerId),
        };
        if (filterOptions?.type) {
            where.type = filterOptions.type;
        }
        return this.customerDocumentRepository.count({ where });
    }
    async update(id, payload) {
        const entity = await this.customerDocumentRepository.findOne({
            where: { id: BigInt(id) },
        });
        if (!entity) {
            return null;
        }
        // TypeORM memperlakukan id berupa BigInt sebagai "tanpa id" pada
        // save() (entitas dianggap baru -> INSERT). Gunakan update() + baca ulang.
        const persistenceModel = customer_document_mapper_1.CustomerDocumentMapper.toPersistence({
            ...customer_document_mapper_1.CustomerDocumentMapper.toDomain(entity),
            ...payload,
        });
        delete persistenceModel.id; // tidak boleh masuk klausa SET
        delete persistenceModel.ulid; // immutable
        await this.customerDocumentRepository.update({ id: BigInt(id) }, persistenceModel);
        const updatedEntity = await this.customerDocumentRepository.findOneByOrFail({
            id: BigInt(id),
        });
        return customer_document_mapper_1.CustomerDocumentMapper.toDomain(updatedEntity);
    }
    async remove(id) {
        await this.customerDocumentRepository.delete({ id: BigInt(id) });
    }
};
exports.CustomerDocumentsRelationalRepository = CustomerDocumentsRelationalRepository;
exports.CustomerDocumentsRelationalRepository = CustomerDocumentsRelationalRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_document_entity_1.CustomerDocumentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomerDocumentsRelationalRepository);
