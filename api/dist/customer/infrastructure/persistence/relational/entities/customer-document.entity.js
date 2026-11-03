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
exports.CustomerDocumentEntity = exports.CUSTOMER_DOCUMENT_OWNER_TYPES = void 0;
const typeorm_1 = require("typeorm");
const relational_entity_helper_1 = require("../../../../../utils/relational-entity-helper");
const ulid_generator_1 = require("../../../../utils/ulid.generator");
exports.CUSTOMER_DOCUMENT_OWNER_TYPES = [
    'customer',
    'branch',
    'staff',
];
let CustomerDocumentEntity = class CustomerDocumentEntity extends relational_entity_helper_1.EntityRelationalHelper {
    assignUlid() {
        if (!this.ulid) {
            this.ulid = (0, ulid_generator_1.generateUlid)();
        }
    }
};
exports.CustomerDocumentEntity = CustomerDocumentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", BigInt)
], CustomerDocumentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 26, nullable: true }),
    __metadata("design:type", Object)
], CustomerDocumentEntity.prototype, "ulid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], CustomerDocumentEntity.prototype, "ownerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", BigInt)
], CustomerDocumentEntity.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], CustomerDocumentEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], CustomerDocumentEntity.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CustomerDocumentEntity.prototype, "fileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], CustomerDocumentEntity.prototype, "issuedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], CustomerDocumentEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CustomerDocumentEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CustomerDocumentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CustomerDocumentEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerDocumentEntity.prototype, "assignUlid", null);
exports.CustomerDocumentEntity = CustomerDocumentEntity = __decorate([
    (0, typeorm_1.Index)('UQ_customer_document_ulid', ['ulid'], { unique: true })
    // Fast lookups of a document set for a given owner (polymorphic, no FK).
    ,
    (0, typeorm_1.Index)('IDX_customer_document_owner', ['ownerType', 'ownerId']),
    (0, typeorm_1.Entity)({ name: 'customer_document' })
], CustomerDocumentEntity);
