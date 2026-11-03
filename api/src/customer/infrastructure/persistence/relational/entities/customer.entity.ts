import {
  AfterInsert,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  InsertEvent,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { generateUlid } from '../../../../utils/ulid.generator';
import { generateCode } from '../../../../utils/code.generator';
import { BranchEntity } from './branch.entity';

@Index('UQ_customer_ulid', ['ulid'], { unique: true })
@Index('UQ_customer_code', ['code'], { unique: true })
@Entity({ name: 'customer' })
export class CustomerEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  /** 26-char ULID, generated in beforeInsert. */
  @Column({ type: 'varchar', length: 26, nullable: true })
  ulid: string | null;

  /** 6-char Crockford Base32 code derived from id, generated in beforeInsert. */
  @Column({ type: 'varchar', length: 6, nullable: true })
  code: string | null;

  @Column({ type: 'varchar', length: 190 })
  name: string;

  /** Host user id (int PK) — main account owner. Nullable. */
  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  npwpNumber: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  nibNumber: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BranchEntity, (branch) => branch.customer)
  branches?: BranchEntity[];

  /**
   * ULID is assigned before insert (no dependency on the DB-generated id).
   * `code` derives from the auto-increment id, which only exists after the
   * row is written, so it is assigned in @AfterInsert.
   */
  @BeforeInsert()
  assignUlid(): void {
    if (!this.ulid) {
      this.ulid = generateUlid();
    }
  }

  @AfterInsert()
  async assignCode(event: InsertEvent<CustomerEntity>): Promise<void> {
    if (this.code || this.id === undefined || this.id === null) {
      return;
    }
    this.code = generateCode(this.id);
    await event.queryRunner?.manager.update(
      CustomerEntity,
      this.id,
      { code: this.code } as never,
    );
  }
}
