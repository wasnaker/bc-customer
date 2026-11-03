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
exports.CustomerDocumentService = void 0;
const common_1 = require("@nestjs/common");
const customer_document_repository_1 = require("../infrastructure/persistence/customer-document.repository");
let CustomerDocumentService = class CustomerDocumentService {
    constructor(customerDocumentRepository) {
        this.customerDocumentRepository = customerDocumentRepository;
    }
    async create(createCustomerDocumentDto) {
        if (!createCustomerDocumentDto.fileId) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    fileId: 'fileIdRequired',
                },
            });
        }
        return this.customerDocumentRepository.create({
            ownerType: createCustomerDocumentDto.ownerType,
            ownerId: BigInt(createCustomerDocumentDto.ownerId),
            type: createCustomerDocumentDto.type,
            number: createCustomerDocumentDto.number ?? null,
            fileId: createCustomerDocumentDto.fileId,
            issuedAt: createCustomerDocumentDto.issuedAt ?? null,
            expiresAt: createCustomerDocumentDto.expiresAt ?? null,
            isActive: createCustomerDocumentDto.isActive ?? true,
        });
    }
    async findManyByOwner({ ownerType, ownerId, filterOptions, sortOptions, paginationOptions, }) {
        return this.customerDocumentRepository.findManyByOwner({
            ownerType,
            ownerId: BigInt(ownerId),
            filterOptions,
            sortOptions,
            paginationOptions,
        });
    }
    async countByOwner(ownerType, ownerId, filterOptions) {
        return this.customerDocumentRepository.countByOwner(ownerType, BigInt(ownerId), filterOptions);
    }
    async findDocumentById(id) {
        return this.customerDocumentRepository.findById(id);
    }
    async update(id, updateCustomerDocumentDto) {
        const document = await this.customerDocumentRepository.findById(id);
        if (!document) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    document: 'customerDocumentNotExists',
                },
            });
        }
        const payload = {
            ...updateCustomerDocumentDto,
        };
        if (updateCustomerDocumentDto.ownerId !== undefined) {
            payload.ownerId = BigInt(updateCustomerDocumentDto.ownerId);
        }
        const updated = await this.customerDocumentRepository.update(id, payload);
        if (!updated) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    document: 'customerDocumentNotExists',
                },
            });
        }
        return updated;
    }
    async remove(id) {
        const document = await this.customerDocumentRepository.findById(id);
        if (!document) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    document: 'customerDocumentNotExists',
                },
            });
        }
        await this.customerDocumentRepository.remove(id);
    }
};
exports.CustomerDocumentService = CustomerDocumentService;
exports.CustomerDocumentService = CustomerDocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customer_document_repository_1.CustomerDocumentRepository])
], CustomerDocumentService);
