import { Branch } from "../../../../domain/branch";
import { BranchEntity } from "../entities/branch.entity";

export class BranchMapper {
  static toDomain(raw: BranchEntity): Branch {
    const domainEntity = new Branch();
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
    // Email admin cabang: staff ter-link user (userId terisi) pertama yang
    // punya email — fallback ke staff pertama yang punya email. Relasi
    // staffs hanya di-load pada list global.
    const staffs = (raw.staff ?? [])
      .slice()
      .sort((a, b) => Number(a.id - b.id));
    const linkedStaff =
      staffs.find((staff) => staff.userId != null) ?? staffs[0];
    domainEntity.adminName = linkedStaff?.name ?? null;
    domainEntity.name = raw.name;
    domainEntity.isHeadOffice = raw.isHeadOffice;
    domainEntity.addressLine = raw.addressLine;
    domainEntity.provinceId = raw.provinceId;
    domainEntity.cityId = raw.cityId;
    domainEntity.postalCode = raw.postalCode;
    domainEntity.vatNumber = raw.vatNumber;
    domainEntity.vatType = raw.vatType as Branch["vatType"];
    domainEntity.isActive = raw.isActive;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Partial<Branch>): BranchEntity {
    const persistenceEntity = new BranchEntity();
    if (domainEntity.id !== undefined && domainEntity.id !== null) {
      persistenceEntity.id = BigInt(domainEntity.id);
    }
    if (domainEntity.ulid !== undefined) {
      persistenceEntity.ulid = domainEntity.ulid;
    }
    if (domainEntity.code !== undefined) {
      persistenceEntity.code = domainEntity.code;
    }
    if (
      domainEntity.customerId !== undefined &&
      domainEntity.customerId !== null
    ) {
      persistenceEntity.customerId = BigInt(domainEntity.customerId);
    }
    persistenceEntity.name = domainEntity.name as string;
    if (domainEntity.isHeadOffice !== undefined) {
      persistenceEntity.isHeadOffice = domainEntity.isHeadOffice;
    }
    persistenceEntity.addressLine = domainEntity.addressLine as string;
    if (
      domainEntity.provinceId !== undefined &&
      domainEntity.provinceId !== null
    ) {
      persistenceEntity.provinceId = domainEntity.provinceId;
    }
    if (domainEntity.cityId !== undefined && domainEntity.cityId !== null) {
      persistenceEntity.cityId = domainEntity.cityId;
    }
    persistenceEntity.postalCode = domainEntity.postalCode ?? null;
    persistenceEntity.vatNumber = domainEntity.vatNumber ?? null;
    if (domainEntity.vatType !== undefined) {
      persistenceEntity.vatType = domainEntity.vatType;
    }
    if (domainEntity.isActive !== undefined) {
      persistenceEntity.isActive = domainEntity.isActive;
    }
    return persistenceEntity;
  }
}
