import { CustomerDocument } from '../../../../domain/customer-document';
import { CustomerDocumentEntity } from '../entities/customer-document.entity';

export class CustomerDocumentMapper {
  static toDomain(raw: CustomerDocumentEntity): CustomerDocument {
    const domainEntity = new CustomerDocument();
    domainEntity.id = raw.id === null || raw.id === undefined ? raw.id : String(raw.id);
    domainEntity.ulid = raw.ulid;
    domainEntity.ownerType =
      raw.ownerType as unknown as CustomerDocument['ownerType'];
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

  static toPersistence(
    domainEntity: Partial<CustomerDocument>,
  ): CustomerDocumentEntity {
    const persistenceEntity = new CustomerDocumentEntity();
    if (domainEntity.id !== undefined && domainEntity.id !== null) {
      persistenceEntity.id = BigInt(domainEntity.id);
    }
    if (domainEntity.ulid !== undefined) {
      persistenceEntity.ulid = domainEntity.ulid;
    }
    persistenceEntity.ownerType =
      domainEntity.ownerType as unknown as CustomerDocumentEntity['ownerType'];
    if (domainEntity.ownerId !== undefined && domainEntity.ownerId !== null) {
      persistenceEntity.ownerId = BigInt(domainEntity.ownerId);
    }
    persistenceEntity.type = domainEntity.type as string;
    persistenceEntity.number = domainEntity.number ?? null;
    persistenceEntity.fileId = domainEntity.fileId as string;
    persistenceEntity.issuedAt = domainEntity.issuedAt ?? null;
    persistenceEntity.expiresAt = domainEntity.expiresAt ?? null;
    if (domainEntity.isActive !== undefined) {
      persistenceEntity.isActive = domainEntity.isActive;
    }
    return persistenceEntity;
  }
}
