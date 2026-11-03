"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerMapper = void 0;
const customer_1 = require("../../../../domain/customer");
const customer_entity_1 = require("../entities/customer.entity");
class CustomerMapper {
    static toDomain(raw) {
        const domainEntity = new customer_1.Customer();
        domainEntity.id = raw.id === null || raw.id === undefined ? raw.id : String(raw.id);
        domainEntity.ulid = raw.ulid;
        domainEntity.code = raw.code;
        domainEntity.name = raw.name;
        domainEntity.userId = raw.userId;
        domainEntity.npwpNumber = raw.npwpNumber;
        domainEntity.nibNumber = raw.nibNumber;
        domainEntity.isActive = raw.isActive;
        domainEntity.createdAt = raw.createdAt;
        domainEntity.updatedAt = raw.updatedAt;
        return domainEntity;
    }
    static toPersistence(domainEntity) {
        const persistenceEntity = new customer_entity_1.CustomerEntity();
        if (domainEntity.id !== undefined && domainEntity.id !== null) {
            persistenceEntity.id = BigInt(domainEntity.id);
        }
        if (domainEntity.ulid !== undefined) {
            persistenceEntity.ulid = domainEntity.ulid;
        }
        if (domainEntity.code !== undefined) {
            persistenceEntity.code = domainEntity.code;
        }
        persistenceEntity.name = domainEntity.name;
        persistenceEntity.userId = domainEntity.userId ?? null;
        persistenceEntity.npwpNumber = domainEntity.npwpNumber ?? null;
        persistenceEntity.nibNumber = domainEntity.nibNumber ?? null;
        if (domainEntity.isActive !== undefined) {
            persistenceEntity.isActive = domainEntity.isActive;
        }
        return persistenceEntity;
    }
}
exports.CustomerMapper = CustomerMapper;
