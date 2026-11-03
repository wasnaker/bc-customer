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
exports.CreateCustomerDto = exports.HeadOfficeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
/** Address block shared by customers (head office), branches and staff. */
class HeadOfficeDto {
}
exports.HeadOfficeDto = HeadOfficeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kantor Pusat Jakarta', maxLength: 190 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(190),
    __metadata("design:type", String)
], HeadOfficeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Jl. Jenderal Sudirman No. 1, Jakarta Selatan',
        maxLength: 255,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], HeadOfficeDto.prototype, "addressLine", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 11, description: 'Province id (int)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], HeadOfficeDto.prototype, "provinceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1101, description: 'Regency id (int)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], HeadOfficeDto.prototype, "cityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '12190', maxLength: 10, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", Object)
], HeadOfficeDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '123456789012345678901234',
        maxLength: 24,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(24),
    __metadata("design:type", Object)
], HeadOfficeDto.prototype, "nitkuNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'npwp',
        enum: ['npwp', 'nitku'],
        default: 'npwp',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['npwp', 'nitku']),
    __metadata("design:type", String)
], HeadOfficeDto.prototype, "vatType", void 0);
class CreateCustomerDto {
}
exports.CreateCustomerDto = CreateCustomerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PT Wasnaker Mandiri', maxLength: 190 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(190),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 5,
        nullable: true,
        description: 'Host user id (main account)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreateCustomerDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '01.234.567.8-901.000',
        maxLength: 20,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", Object)
], CreateCustomerDto.prototype, "npwpNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '1234567890123456',
        maxLength: 20,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", Object)
], CreateCustomerDto.prototype, "nibNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: HeadOfficeDto }),
    (0, class_transformer_1.Type)(() => HeadOfficeDto),
    __metadata("design:type", HeadOfficeDto)
], CreateCustomerDto.prototype, "headOffice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCustomerDto.prototype, "isActive", void 0);
