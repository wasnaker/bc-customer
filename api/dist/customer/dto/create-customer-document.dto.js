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
exports.CreateCustomerDocumentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const customer_document_1 = require("../domain/customer-document");
class CreateCustomerDocumentDto {
}
exports.CreateCustomerDocumentDto = CreateCustomerDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: customer_document_1.CUSTOMER_DOCUMENT_OWNER_TYPES }),
    (0, class_transformer_1.Transform)(({ value }) => String(value)),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(Object.values(customer_document_1.CustomerDocumentOwnerTypeEnum)),
    __metadata("design:type", String)
], CreateCustomerDocumentDto.prototype, "ownerType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1', description: 'Owner id (bigint as string)' }),
    (0, class_transformer_1.Transform)(({ value }) => (value === undefined || value === '' ? value : String(value))),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDocumentDto.prototype, "ownerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'npwp', maxLength: 50 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateCustomerDocumentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '01.234.567.8-901.000',
        maxLength: 50,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", Object)
], CreateCustomerDocumentDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0f0e8d7c-6b5a-4938-a271-0f9e8d7c6b5a',
        description: 'Host file id (uuid)',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCustomerDocumentDto.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-01-15', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Object)
], CreateCustomerDocumentDto.prototype, "issuedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2031-01-15', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Object)
], CreateCustomerDocumentDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCustomerDocumentDto.prototype, "isActive", void 0);
