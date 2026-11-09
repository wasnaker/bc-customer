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
exports.CustomerDocument = exports.CUSTOMER_DOCUMENT_OWNER_TYPES = exports.CustomerDocumentOwnerTypeEnum = void 0;
const swagger_1 = require("@nestjs/swagger");
var CustomerDocumentOwnerTypeEnum;
(function (CustomerDocumentOwnerTypeEnum) {
    CustomerDocumentOwnerTypeEnum["CUSTOMER"] = "customer";
    CustomerDocumentOwnerTypeEnum["BRANCH"] = "branch";
    CustomerDocumentOwnerTypeEnum["STAFF"] = "staff";
})(CustomerDocumentOwnerTypeEnum || (exports.CustomerDocumentOwnerTypeEnum = CustomerDocumentOwnerTypeEnum = {}));
exports.CUSTOMER_DOCUMENT_OWNER_TYPES = [
    CustomerDocumentOwnerTypeEnum.CUSTOMER,
    CustomerDocumentOwnerTypeEnum.BRANCH,
    CustomerDocumentOwnerTypeEnum.STAFF,
];
class CustomerDocument {
}
exports.CustomerDocument = CustomerDocument;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1', description: 'Bigint PK serialized as string' }),
    __metadata("design:type", Object)
], CustomerDocument.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01JD8X7Q3K4M2N5P6R8T9VWXYZ' }),
    __metadata("design:type", Object)
], CustomerDocument.prototype, "ulid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'customer', enum: CustomerDocumentOwnerTypeEnum }),
    __metadata("design:type", String)
], CustomerDocument.prototype, "ownerType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1', description: 'Owner id (customer/branch/staff)' }),
    __metadata("design:type", Object)
], CustomerDocument.prototype, "ownerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'npwp', description: 'nib / npwp / nitku / legalitas / …' }),
    __metadata("design:type", String)
], CustomerDocument.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01.234.567.8-901.000', nullable: true }),
    __metadata("design:type", Object)
], CustomerDocument.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0f0e8d7c-6b5a-4938-a271-0f9e8d7c6b5a',
        description: 'Host file id (uuid) — file sebagai bukti dokumen',
    }),
    __metadata("design:type", String)
], CustomerDocument.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-01-15', nullable: true }),
    __metadata("design:type", Object)
], CustomerDocument.prototype, "issuedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2031-01-15', nullable: true }),
    __metadata("design:type", Object)
], CustomerDocument.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], CustomerDocument.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], CustomerDocument.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], CustomerDocument.prototype, "updatedAt", void 0);
