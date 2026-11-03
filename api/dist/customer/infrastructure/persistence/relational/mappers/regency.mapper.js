"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegencyMapper = void 0;
const regency_1 = require("../../../../domain/regency");
const regency_entity_1 = require("../entities/regency.entity");
class RegencyMapper {
    static toDomain(raw) {
        const domainEntity = new regency_1.Regency();
        domainEntity.id = raw.id;
        domainEntity.provinceId = raw.provinceId;
        domainEntity.name = raw.name;
        domainEntity.code = raw.code;
        domainEntity.type = raw.type;
        domainEntity.isActive = raw.isActive;
        domainEntity.createdAt = raw.createdAt;
        domainEntity.updatedAt = raw.updatedAt;
        return domainEntity;
    }
    static toPersistence(domainEntity) {
        const persistenceEntity = new regency_entity_1.RegencyEntity();
        if (domainEntity.id && typeof domainEntity.id === 'number') {
            persistenceEntity.id = domainEntity.id;
        }
        if (domainEntity.provinceId !== undefined) {
            persistenceEntity.provinceId = Number(domainEntity.provinceId);
        }
        persistenceEntity.name = domainEntity.name;
        if (domainEntity.code !== undefined) {
            persistenceEntity.code = domainEntity.code;
        }
        persistenceEntity.type = domainEntity.type;
        persistenceEntity.isActive = domainEntity.isActive ?? true;
        persistenceEntity.createdAt = domainEntity.createdAt;
        persistenceEntity.updatedAt = domainEntity.updatedAt;
        return persistenceEntity;
    }
}
exports.RegencyMapper = RegencyMapper;
