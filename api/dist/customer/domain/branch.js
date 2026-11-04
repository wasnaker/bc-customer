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
exports.Branch = void 0;
const swagger_1 = require("@nestjs/swagger");
class Branch {
}
exports.Branch = Branch;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1", description: "Bigint PK serialized as string" }),
    __metadata("design:type", Object)
], Branch.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "01JD8X7Q3K4M2N5P6R8T9VWXYZ" }),
    __metadata("design:type", Object)
], Branch.prototype, "ulid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "0000A1", description: "6-char Crockford Base32" }),
    __metadata("design:type", Object)
], Branch.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1", description: "Owning customer id" }),
    __metadata("design:type", Object)
], Branch.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "PT Sentosa Mitra Logistik" }),
    __metadata("design:type", Object)
], Branch.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Kantor Pusat Jakarta" }),
    __metadata("design:type", String)
], Branch.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], Branch.prototype, "isHeadOffice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Jl. Jenderal Sudirman No. 1, Jakarta Selatan" }),
    __metadata("design:type", String)
], Branch.prototype, "addressLine", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 11, description: "Province id (int)" }),
    __metadata("design:type", Number)
], Branch.prototype, "provinceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1101, description: "Regency id (int)" }),
    __metadata("design:type", Number)
], Branch.prototype, "cityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "12190", nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "123456789012345678901234", nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "nitkuNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "npwp",
        enum: ["npwp", "nitku"],
        default: "npwp",
    }),
    __metadata("design:type", String)
], Branch.prototype, "vatType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], Branch.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], Branch.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], Branch.prototype, "updatedAt", void 0);
