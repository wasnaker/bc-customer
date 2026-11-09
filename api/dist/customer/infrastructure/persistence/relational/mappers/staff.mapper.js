"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffMapper = void 0;
const staff_1 = require("../../../../domain/staff");
const staff_entity_1 = require("../entities/staff.entity");
class StaffMapper {
    static toDomain(raw) {
        const domainEntity = new staff_1.Staff();
        domainEntity.id =
            raw.id === null || raw.id === undefined ? raw.id : String(raw.id);
        domainEntity.ulid = raw.ulid;
        domainEntity.branchId =
            raw.branchId === null || raw.branchId === undefined
                ? raw.branchId
                : String(raw.branchId);
        // Nama branch/customer hanya tersedia bila relasi di-load (list global).
        domainEntity.branchName = raw.branch?.name ?? null;
        domainEntity.customerName = raw.branch?.customer?.name ?? null;
        domainEntity.customerId = raw.branch?.customerId == null ? null : String(raw.branch.customerId);
        domainEntity.name = raw.name;
        domainEntity.userId = raw.userId;
        domainEntity.position = raw.position;
        domainEntity.phone = raw.phone;
        domainEntity.email = raw.email;
        domainEntity.nip = raw.nip;
        domainEntity.addressLine = raw.addressLine;
        domainEntity.provinceId = raw.provinceId;
        domainEntity.cityId = raw.cityId;
        domainEntity.photoId = raw.photoId;
        domainEntity.isActive = raw.isActive;
        domainEntity.createdAt = raw.createdAt;
        domainEntity.updatedAt = raw.updatedAt;
        return domainEntity;
    }
    static toPersistence(domainEntity) {
        const persistenceEntity = new staff_entity_1.StaffEntity();
        if (domainEntity.id !== undefined && domainEntity.id !== null) {
            persistenceEntity.id = BigInt(domainEntity.id);
        }
        if (domainEntity.ulid !== undefined) {
            persistenceEntity.ulid = domainEntity.ulid;
        }
        if (domainEntity.branchId !== undefined && domainEntity.branchId !== null) {
            persistenceEntity.branchId = BigInt(domainEntity.branchId);
        }
        persistenceEntity.name = domainEntity.name;
        persistenceEntity.userId = domainEntity.userId ?? null;
        persistenceEntity.position = domainEntity.position ?? null;
        persistenceEntity.phone = domainEntity.phone ?? null;
        persistenceEntity.email = domainEntity.email ?? null;
        persistenceEntity.nip = domainEntity.nip ?? null;
        persistenceEntity.addressLine = domainEntity.addressLine ?? null;
        persistenceEntity.provinceId = domainEntity.provinceId ?? null;
        persistenceEntity.cityId = domainEntity.cityId ?? null;
        persistenceEntity.photoId = domainEntity.photoId ?? null;
        if (domainEntity.isActive !== undefined) {
            persistenceEntity.isActive = domainEntity.isActive;
        }
        return persistenceEntity;
    }
}
exports.StaffMapper = StaffMapper;
