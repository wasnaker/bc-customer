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
exports.Province = void 0;
const swagger_1 = require("@nestjs/swagger");
class Province {
}
exports.Province = Province;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Object)
], Province.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jawa Barat' }),
    __metadata("design:type", String)
], Province.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'JB', nullable: true }),
    __metadata("design:type", Object)
], Province.prototype, "isoCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -6.9, nullable: true }),
    __metadata("design:type", Object)
], Province.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 107.6, nullable: true }),
    __metadata("design:type", Object)
], Province.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], Province.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], Province.prototype, "updatedAt", void 0);
