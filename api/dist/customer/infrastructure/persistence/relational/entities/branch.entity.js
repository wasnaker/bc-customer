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
exports.BranchEntity = void 0;
const typeorm_1 = require("typeorm");
const relational_entity_helper_1 = require("../../../../../utils/relational-entity-helper");
const ulid_generator_1 = require("../../../../utils/ulid.generator");
const customer_entity_1 = require("./customer.entity");
const staff_entity_1 = require("./staff.entity");
let BranchEntity = class BranchEntity extends relational_entity_helper_1.EntityRelationalHelper {
    assignUlid() {
        if (!this.ulid) {
            this.ulid = (0, ulid_generator_1.generateUlid)();
        }
    }
};
exports.BranchEntity = BranchEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", BigInt)
], BranchEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 26, nullable: true }),
    __metadata("design:type", Object)
], BranchEntity.prototype, "ulid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 6, nullable: true }),
    __metadata("design:type", Object)
], BranchEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.CustomerEntity, (customer) => customer.branches, {
        onDelete: 'CASCADE',
        nullable: false,
    }),
    __metadata("design:type", customer_entity_1.CustomerEntity)
], BranchEntity.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", BigInt)
], BranchEntity.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 190 }),
    __metadata("design:type", String)
], BranchEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BranchEntity.prototype, "isHeadOffice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], BranchEntity.prototype, "addressLine", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BranchEntity.prototype, "provinceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BranchEntity.prototype, "cityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", Object)
], BranchEntity.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 24, nullable: true }),
    __metadata("design:type", Object)
], BranchEntity.prototype, "nitkuNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'npwp' }),
    __metadata("design:type", String)
], BranchEntity.prototype, "vatType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BranchEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BranchEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BranchEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => staff_entity_1.StaffEntity, (staff) => staff.branch),
    __metadata("design:type", Array)
], BranchEntity.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BranchEntity.prototype, "assignUlid", null);
exports.BranchEntity = BranchEntity = __decorate([
    (0, typeorm_1.Index)('UQ_branch_ulid', ['ulid'], { unique: true }),
    (0, typeorm_1.Index)('UQ_branch_code', ['code'], { unique: true })
    // Max 1 head office per customer — partial unique index.
    ,
    (0, typeorm_1.Index)('UQ_branch_headOffice', ['customerId'], {
        unique: true,
        where: '"isHeadOffice" = true',
    }),
    (0, typeorm_1.Entity)({ name: 'branch' })
], BranchEntity);
