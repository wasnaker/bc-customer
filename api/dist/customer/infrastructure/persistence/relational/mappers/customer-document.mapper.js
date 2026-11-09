"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDocumentMapper = void 0;
const customer_document_1 = require("../../../../domain/customer-document");
const customer_document_entity_1 = require("../entities/customer-document.entity");
class CustomerDocumentMapper {
    static toDomain(raw) {
        const domainEntity = new customer_document_1.CustomerDocument();
        domainEntity.id = raw.id === null || raw.id === undefined ? raw.id : String(raw.id);
        domainEntity.ulid = raw.ulid;
        domainEntity.ownerType =
            raw.ownerType;
        domainEntity.ownerId =
            raw.ownerId === null || raw.ownerId === undefined
                ? raw.ownerId
                : String(raw.ownerId);
        domainEntity.type = raw.type;
        domainEntity.number = raw.number;
        domainEntity.fileId = raw.fileId;
        domainEntity.issuedAt = raw.issuedAt;
        domainEntity.expiresAt = raw.expiresAt;
        domainEntity.isActive = raw.isActive;
        domainEntity.createdAt = raw.createdAt;
        domainEntity.updatedAt = raw.updatedAt;
        return domainEntity;
    }
    static toPersistence(domainEntity) {
        const persistenceEntity = new customer_document_entity_1.CustomerDocumentEntity();
        if (domainEntity.id !== undefined && domainEntity.id !== null) {
            persistenceEntity.id = BigInt(domainEntity.id);
        }
        if (domainEntity.ulid !== undefined) {
            persistenceEntity.ulid = domainEntity.ulid;
        }
        persistenceEntity.ownerType =
            domainEntity.ownerType;
        if (domainEntity.ownerId !== undefined && domainEntity.ownerId !== null) {
            persistenceEntity.ownerId = BigInt(domainEntity.ownerId);
        }
        persistenceEntity.type = domainEntity.type;
        persistenceEntity.number = domainEntity.number ?? null;
        persistenceEntity.fileId = domainEntity.fileId;
        persistenceEntity.issuedAt = domainEntity.issuedAt ?? null;
        persistenceEntity.expiresAt = domainEntity.expiresAt ?? null;
        if (domainEntity.isActive !== undefined) {
            persistenceEntity.isActive = domainEntity.isActive;
        }
        return persistenceEntity;
    }
}
exports.CustomerDocumentMapper = CustomerDocumentMapper;
