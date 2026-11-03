import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
export declare const CUSTOMER_DOCUMENT_OWNER_TYPES: readonly ["customer", "branch", "staff"];
export type CustomerDocumentOwnerType = (typeof CUSTOMER_DOCUMENT_OWNER_TYPES)[number];
export declare class CustomerDocumentEntity extends EntityRelationalHelper {
    id: bigint;
    /** 26-char ULID, generated in beforeInsert. */
    ulid: string | null;
    /** Polymorphic owner discriminator: 'customer' | 'branch' | 'staff'. */
    ownerType: CustomerDocumentOwnerType;
    /** id of the owning customer/branch/staff row (bigint PK, no FK). */
    ownerId: bigint;
    /** Jenis dokumen: nib, npwp, nitku, legalitas, … */
    type: string;
    number: string | null;
    /** Host file id (uuid PK) — file sebagai bukti/validasi (I2). */
    fileId: string;
    issuedAt: Date | string | null;
    expiresAt: Date | string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    assignUlid(): void;
}
