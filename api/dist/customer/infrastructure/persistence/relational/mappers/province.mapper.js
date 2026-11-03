"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvinceMapper = void 0;
const province_1 = require("../../../../domain/province");
const province_entity_1 = require("../entities/province.entity");
class ProvinceMapper {
    static toDomain(raw) {
        const domainEntity = new province_1.Province();
        domainEntity.id = raw.id;
        domainEntity.name = raw.name;
        domainEntity.isoCode = raw.isoCode;
        domainEntity.latitude = raw.latitude === null ? null : Number(raw.latitude);
        domainEntity.longitude =
            raw.longitude === null ? null : Number(raw.longitude);
        domainEntity.createdAt = raw.createdAt;
        domainEntity.updatedAt = raw.updatedAt;
        return domainEntity;
    }
    static toPersistence(domainEntity) {
        const persistenceEntity = new province_entity_1.ProvinceEntity();
        if (domainEntity.id && typeof domainEntity.id === 'number') {
            persistenceEntity.id = domainEntity.id;
        }
        persistenceEntity.name = domainEntity.name;
        persistenceEntity.isoCode = domainEntity.isoCode ?? null;
        persistenceEntity.latitude = domainEntity.latitude ?? null;
        persistenceEntity.longitude = domainEntity.longitude ?? null;
        persistenceEntity.createdAt = domainEntity.createdAt;
        persistenceEntity.updatedAt = domainEntity.updatedAt;
        return persistenceEntity;
    }
}
exports.ProvinceMapper = ProvinceMapper;
