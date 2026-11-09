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
exports.Staff = void 0;
const swagger_1 = require("@nestjs/swagger");
class Staff {
}
exports.Staff = Staff;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1", description: "Bigint PK serialized as string" }),
    __metadata("design:type", Object)
], Staff.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "01JD8X7Q3K4M2N5P6R8T9VWXYZ" }),
    __metadata("design:type", Object)
], Staff.prototype, "ulid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1", description: "Owning branch id" }),
    __metadata("design:type", Object)
], Staff.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Cabang Bandung PT Baja Prima Konstruksi" }),
    __metadata("design:type", Object)
], Staff.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "PT Baja Prima Konstruksi" }),
    __metadata("design:type", Object)
], Staff.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "17", description: "Owning customer id" }),
    __metadata("design:type", Object)
], Staff.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Budi Santoso" }),
    __metadata("design:type", String)
], Staff.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        nullable: true,
        description: "Host user id (unique across staff when set)",
    }),
    __metadata("design:type", Object)
], Staff.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Manager", nullable: true }),
    __metadata("design:type", Object)
], Staff.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "+6281234567890", nullable: true }),
    __metadata("design:type", Object)
], Staff.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "budi@example.com", nullable: true }),
    __metadata("design:type", Object)
], Staff.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "19800001", nullable: true, description: "NIP" }),
    __metadata("design:type", Object)
], Staff.prototype, "nip", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Jl. Melati No. 5", nullable: true }),
    __metadata("design:type", Object)
], Staff.prototype, "addressLine", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 11,
        nullable: true,
        description: "Province id (int), untuk modul actor lain",
    }),
    __metadata("design:type", Object)
], Staff.prototype, "provinceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1101,
        nullable: true,
        description: "Regency id (int), untuk modul actor lain",
    }),
    __metadata("design:type", Object)
], Staff.prototype, "cityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "0f0e8d7c-6b5a-4938-a271-0f9e8d7c6b5a",
        nullable: true,
        description: "Host file id (uuid)",
    }),
    __metadata("design:type", Object)
], Staff.prototype, "photoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], Staff.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], Staff.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], Staff.prototype, "updatedAt", void 0);
