import {
  AfterInsert,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  InsertEvent,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { generateUlid } from '../../../../utils/ulid.generator';
import { generateCode } from '../../../../utils/code.generator';
import { CustomerEntity } from './customer.entity';
import { StaffEntity } from './staff.entity';

@Index('UQ_branch_ulid', ['ulid'], { unique: true })
@Index('UQ_branch_code', ['code'], { unique: true })
// Max 1 head office per customer — partial unique index.
@Index('UQ_branch_headOffice', ['customerId'], {
  unique: true,
  where: '"isHeadOffice" = true',
})
@Entity({ name: 'branch' })
export class BranchEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  /** 26-char ULID, generated in beforeInsert. */
  @Column({ type: 'varchar', length: 26, nullable: true })
  ulid: string | null;

  /** 6-char Crockford Base32 code derived from id, generated in afterInsert. */
  @Column({ type: 'varchar', length: 6, nullable: true })
  code: string | null;

  /** Owning customer (bigint PK, intra-module). Cascade delete via FK. */
  @ManyToOne(() => CustomerEntity, (customer) => customer.branches, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  customer: CustomerEntity;

  @Column({ type: 'bigint' })
  customerId: bigint;

  @Column({ type: 'varchar', length: 190 })
  name: string;

  @Column({ type: 'boolean', default: false })
  isHeadOffice: boolean;

  /**
   * Alamat lengkap cabang. Wajib untuk SEMUA branch (J2):
   * cabang bisa beda kota beda provinsi, jadi alamat tidak boleh kosong.
   */
  @Column({ type: 'varchar', length: 255 })
  addressLine: string;

  /** Host province id (int PK, owned by the region module). FK RESTRICT. */
  @Column({ type: 'int' })
  provinceId: number;

  /** Host regency id (int PK, owned by the region module). FK RESTRICT. */
  @Column({ type: 'int' })
  cityId: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  postalCode: string | null;

  @Column({ type: 'varchar', length: 24, nullable: true })
  nitkuNumber: string | null;

  /** VAT basis for invoices: 'npwp' (default) or 'nitku'. */
  @Column({ type: 'varchar', length: 10, default: 'npwp' })
  vatType: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => StaffEntity, (staff) => staff.branch)
  staff?: StaffEntity[];

  @BeforeInsert()
  assignUlid(): void {
    if (!this.ulid) {
      this.ulid = generateUlid();
    }
  }

  @AfterInsert()
  async assignCode(event: InsertEvent<BranchEntity>): Promise<void> {
    if (this.code || this.id === undefined || this.id === null) {
      return;
    }
    this.code = generateCode(this.id);
    await event.queryRunner?.manager.update(
      BranchEntity,
      this.id,
      { code: this.code } as never,
    );
  }
}
