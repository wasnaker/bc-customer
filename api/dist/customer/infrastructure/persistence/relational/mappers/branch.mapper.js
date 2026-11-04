"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchMapper = void 0;
const branch_1 = require("../../../../domain/branch");
const branch_entity_1 = require("../entities/branch.entity");
class BranchMapper {
    static toDomain(raw) {
        const domainEntity = new branch_1.Branch();
        domainEntity.id =
            raw.id === null || raw.id === undefined ? raw.id : String(raw.id);
        domainEntity.ulid = raw.ulid;
        domainEntity.code = raw.code;
        domainEntity.customerId =
            raw.customerId === null || raw.customerId === undefined
                ? raw.customerId
                : String(raw.customerId);
        // Nama customer hanya tersedia bila relasi di-load (list global).
        domainEntity.customerName = raw.customer?.name ?? null;
        domainEntity.name = raw.name;
        domainEntity.isHeadOffice = raw.isHeadOffice;
        domainEntity.addressLine = raw.addressLine;
        domainEntity.provinceId = raw.provinceId;
        domainEntity.cityId = raw.cityId;
        domainEntity.postalCode = raw.postalCode;
        domainEntity.nitkuNumber = raw.nitkuNumber;
        domainEntity.vatType = raw.vatType;
        domainEntity.isActive = raw.isActive;
        domainEntity.createdAt = raw.createdAt;
        domainEntity.updatedAt = raw.updatedAt;
        return domainEntity;
    }
    static toPersistence(domainEntity) {
        const persistenceEntity = new branch_entity_1.BranchEntity();
        if (domainEntity.id !== undefined && domainEntity.id !== null) {
            persistenceEntity.id = BigInt(domainEntity.id);
        }
        if (domainEntity.ulid !== undefined) {
            persistenceEntity.ulid = domainEntity.ulid;
        }
        if (domainEntity.code !== undefined) {
            persistenceEntity.code = domainEntity.code;
        }
        if (domainEntity.customerId !== undefined &&
            domainEntity.customerId !== null) {
            persistenceEntity.customerId = BigInt(domainEntity.customerId);
        }
        persistenceEntity.name = domainEntity.name;
        if (domainEntity.isHeadOffice !== undefined) {
            persistenceEntity.isHeadOffice = domainEntity.isHeadOffice;
        }
        persistenceEntity.addressLine = domainEntity.addressLine;
        if (domainEntity.provinceId !== undefined &&
            domainEntity.provinceId !== null) {
            persistenceEntity.provinceId = domainEntity.provinceId;
        }
        if (domainEntity.cityId !== undefined && domainEntity.cityId !== null) {
            persistenceEntity.cityId = domainEntity.cityId;
        }
        persistenceEntity.postalCode = domainEntity.postalCode ?? null;
        persistenceEntity.nitkuNumber = domainEntity.nitkuNumber ?? null;
        if (domainEntity.vatType !== undefined) {
            persistenceEntity.vatType = domainEntity.vatType;
        }
        if (domainEntity.isActive !== undefined) {
            persistenceEntity.isActive = domainEntity.isActive;
        }
        return persistenceEntity;
    }
}
exports.BranchMapper = BranchMapper;
