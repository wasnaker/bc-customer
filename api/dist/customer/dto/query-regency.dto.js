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
exports.QueryRegencyDto = exports.SortRegencyDto = exports.FilterRegencyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const regency_1 = require("../domain/regency");
class FilterRegencyDto {
}
exports.FilterRegencyDto = FilterRegencyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'province_id', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const rawValue = value ?? obj?.province_id;
        if (rawValue === undefined || rawValue === null || rawValue === '') {
            return undefined;
        }
        const parsed = Number(rawValue);
        return Number.isFinite(parsed) ? parsed : rawValue;
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], FilterRegencyDto.prototype, "provinceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: regency_1.RegencyTypeEnum }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(regency_1.RegencyTypeEnum),
    __metadata("design:type", String)
], FilterRegencyDto.prototype, "type", void 0);
class SortRegencyDto {
}
exports.SortRegencyDto = SortRegencyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], SortRegencyDto.prototype, "orderBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ASC', 'DESC'] }),
    (0, class_transformer_1.Transform)(({ value }) => String(value).toUpperCase()),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], SortRegencyDto.prototype, "order", void 0);
class QueryRegencyDto {
}
exports.QueryRegencyDto = QueryRegencyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, default: 1 }),
    (0, class_transformer_1.Transform)(({ value }) => (value === undefined || value === '' ? 1 : Number(value))),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryRegencyDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 50, default: 10 }),
    (0, class_transformer_1.Transform)(({ value }) => (value === undefined || value === '' ? 10 : Number(value))),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryRegencyDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'province_id', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const rawValue = value ?? obj?.province_id;
        if (rawValue === undefined || rawValue === null || rawValue === '') {
            return undefined;
        }
        const parsed = Number(rawValue);
        return Number.isFinite(parsed) ? parsed : rawValue;
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], QueryRegencyDto.prototype, "provinceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return value ? JSON.parse(value) : undefined;
        }
        catch {
            return undefined;
        }
    }),
    (0, class_transformer_1.Type)(() => FilterRegencyDto),
    __metadata("design:type", Object)
], QueryRegencyDto.prototype, "filters", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return value ? JSON.parse(value) : undefined;
        }
        catch {
            return undefined;
        }
    }),
    (0, class_transformer_1.Type)(() => SortRegencyDto),
    __metadata("design:type", Object)
], QueryRegencyDto.prototype, "sort", void 0);
