import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { generateUlid } from '../../../../utils/ulid.generator';

export const CUSTOMER_DOCUMENT_OWNER_TYPES = [
  'customer',
  'branch',
  'staff',
] as const;

export type CustomerDocumentOwnerType =
  (typeof CUSTOMER_DOCUMENT_OWNER_TYPES)[number];

@Index('UQ_customer_document_ulid', ['ulid'], { unique: true })
// Fast lookups of a document set for a given owner (polymorphic, no FK).
@Index('IDX_customer_document_owner', ['ownerType', 'ownerId'])
@Entity({ name: 'customer_document' })
export class CustomerDocumentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  /** 26-char ULID, generated in beforeInsert. */
  @Column({ type: 'varchar', length: 26, nullable: true })
  ulid: string | null;

  /** Polymorphic owner discriminator: 'customer' | 'branch' | 'staff'. */
  @Column({ type: 'varchar', length: 20 })
  ownerType: CustomerDocumentOwnerType;

  /** id of the owning customer/branch/staff row (bigint PK, no FK). */
  @Column({ type: 'bigint' })
  ownerId: bigint;

  /** Jenis dokumen: nib, npwp, nitku, legalitas, … */
  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  number: string | null;

  /** Host file id (uuid PK) — file sebagai bukti/validasi (I2). */
  @Column({ type: 'uuid' })
  fileId: string;

  @Column({ type: 'date', nullable: true })
  issuedAt: Date | string | null;

  @Column({ type: 'date', nullable: true })
  expiresAt: Date | string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  assignUlid(): void {
    if (!this.ulid) {
      this.ulid = generateUlid();
    }
  }
}
