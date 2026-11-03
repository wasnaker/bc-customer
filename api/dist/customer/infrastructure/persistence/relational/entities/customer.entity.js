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
var CustomerEntity_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerEntity = void 0;
const typeorm_1 = require("typeorm");
const relational_entity_helper_1 = require("../../../../../utils/relational-entity-helper");
const ulid_generator_1 = require("../../../../utils/ulid.generator");
const code_generator_1 = require("../../../../utils/code.generator");
const branch_entity_1 = require("./branch.entity");
let CustomerEntity = CustomerEntity_1 = class CustomerEntity extends relational_entity_helper_1.EntityRelationalHelper {
    /**
     * ULID is assigned before insert (no dependency on the DB-generated id).
     * `code` derives from the auto-increment id, which only exists after the
     * row is written, so it is assigned in @AfterInsert.
     */
    assignUlid() {
        if (!this.ulid) {
            this.ulid = (0, ulid_generator_1.generateUlid)();
        }
    }
    async assignCode(event) {
        if (this.code || this.id === undefined || this.id === null) {
            return;
        }
        this.code = (0, code_generator_1.generateCode)(this.id);
        await event.queryRunner?.manager.update(CustomerEntity_1, this.id, { code: this.code });
    }
};
exports.CustomerEntity = CustomerEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", BigInt)
], CustomerEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 26, nullable: true }),
    __metadata("design:type", Object)
], CustomerEntity.prototype, "ulid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 6, nullable: true }),
    __metadata("design:type", Object)
], CustomerEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 190 }),
    __metadata("design:type", String)
], CustomerEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], CustomerEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], CustomerEntity.prototype, "npwpNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], CustomerEntity.prototype, "nibNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CustomerEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CustomerEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CustomerEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => branch_entity_1.BranchEntity, (branch) => branch.customer),
    __metadata("design:type", Array)
], CustomerEntity.prototype, "branches", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerEntity.prototype, "assignUlid", null);
__decorate([
    (0, typeorm_1.AfterInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerEntity.prototype, "assignCode", null);
exports.CustomerEntity = CustomerEntity = CustomerEntity_1 = __decorate([
    (0, typeorm_1.Index)('UQ_customer_ulid', ['ulid'], { unique: true }),
    (0, typeorm_1.Index)('UQ_customer_code', ['code'], { unique: true }),
    (0, typeorm_1.Entity)({ name: 'customer' })
], CustomerEntity);
