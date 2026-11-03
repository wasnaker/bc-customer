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
exports.RegencyEntity = void 0;
const typeorm_1 = require("typeorm");
const relational_entity_helper_1 = require("../../../../../utils/relational-entity-helper");
const province_entity_1 = require("./province.entity");
let RegencyEntity = class RegencyEntity extends relational_entity_helper_1.EntityRelationalHelper {
};
exports.RegencyEntity = RegencyEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RegencyEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: Number }),
    __metadata("design:type", Number)
], RegencyEntity.prototype, "provinceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => province_entity_1.ProvinceEntity, {
        onDelete: 'CASCADE',
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'provinceId' }),
    __metadata("design:type", province_entity_1.ProvinceEntity)
], RegencyEntity.prototype, "province", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: String, length: 190 }),
    __metadata("design:type", String)
], RegencyEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: String, unique: true, nullable: true }),
    __metadata("design:type", Object)
], RegencyEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: String, default: 'kabupaten' }),
    __metadata("design:type", String)
], RegencyEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], RegencyEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RegencyEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RegencyEntity.prototype, "updatedAt", void 0);
exports.RegencyEntity = RegencyEntity = __decorate([
    (0, typeorm_1.Index)('UQ_regency_province_name', ['provinceId', 'name'], { unique: true }),
    (0, typeorm_1.Entity)({
        name: 'regency',
    })
], RegencyEntity);
