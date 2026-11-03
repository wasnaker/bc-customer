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
exports.Customer = void 0;
const swagger_1 = require("@nestjs/swagger");
const branch_1 = require("./branch");
class Customer {
}
exports.Customer = Customer;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1', description: 'Bigint PK serialized as string' }),
    __metadata("design:type", Object)
], Customer.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01JD8X7Q3K4M2N5P6R8T9VWXYZ' }),
    __metadata("design:type", Object)
], Customer.prototype, "ulid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0000A1', description: '6-char Crockford Base32' }),
    __metadata("design:type", Object)
], Customer.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PT Wasnaker Mandiri' }),
    __metadata("design:type", String)
], Customer.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        nullable: true,
        description: 'Host user id (main account)',
    }),
    __metadata("design:type", Object)
], Customer.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01.234.567.8-901.000', nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "npwpNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234567890123456', nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "nibNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: branch_1.Branch }),
    __metadata("design:type", branch_1.Branch)
], Customer.prototype, "headOffice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], Customer.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], Customer.prototype, "updatedAt", void 0);
