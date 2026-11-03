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
exports.Regency = exports.REGENCY_TYPES = exports.RegencyTypeEnum = void 0;
const swagger_1 = require("@nestjs/swagger");
var RegencyTypeEnum;
(function (RegencyTypeEnum) {
    RegencyTypeEnum["KABUPATEN"] = "kabupaten";
    RegencyTypeEnum["KOTA"] = "kota";
})(RegencyTypeEnum || (exports.RegencyTypeEnum = RegencyTypeEnum = {}));
exports.REGENCY_TYPES = [
    { value: RegencyTypeEnum.KABUPATEN, label: 'Kabupaten' },
    { value: RegencyTypeEnum.KOTA, label: 'Kota' },
];
class Regency {
}
exports.Regency = Regency;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Object)
], Regency.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Object)
], Regency.prototype, "provinceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bandung' }),
    __metadata("design:type", String)
], Regency.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '32.73', description: 'Kode BPS 4 digit' }),
    __metadata("design:type", Object)
], Regency.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'kota' }),
    __metadata("design:type", String)
], Regency.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], Regency.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], Regency.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], Regency.prototype, "updatedAt", void 0);
