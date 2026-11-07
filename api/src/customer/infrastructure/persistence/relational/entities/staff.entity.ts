import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { generateUlid } from '../../../../utils/ulid.generator';
import { BranchEntity } from './branch.entity';

@Index('UQ_staff_ulid', ['ulid'], { unique: true })
// A user account may be linked to at most one staff record.
@Index('UQ_staff_userId', ['userId'], { unique: true })
@Entity({ name: 'staff' })
export class StaffEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  /** 26-char ULID, generated in beforeInsert. */
  @Column({ type: 'varchar', length: 26, nullable: true })
  ulid: string | null;

  /** Owning branch (bigint PK, intra-module). FK RESTRICT — tidak ikut terhapus. */
  @ManyToOne(() => BranchEntity, (branch) => branch.staff, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  branch: BranchEntity;

  @Column({ type: 'bigint' })
  branchId: bigint;

  @Column({ type: 'varchar', length: 190 })
  name: string;

  /** Host user id (int PK) — nullable; unique across all staff when set. */
  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 190, nullable: true })
  email: string | null;

  /** NIP pegawai — nullable (I4). */
  @Column({ type: 'varchar', length: 50, nullable: true })
  nip: string | null;

  /** Alamat staff — nullable (I4). */
  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine: string | null;

  /** Host province id — nullable, untuk modul actor lain (I4). */
  @Column({ type: 'int', nullable: true })
  provinceId: number | null;

  /** Host regency id — nullable, untuk modul actor lain (I4). */
  @Column({ type: 'int', nullable: true })
  cityId: number | null;

  /** Host file id (uuid PK). Nullable profile photo. */
  @Column({ type: 'uuid', nullable: true })
  photoId: string | null;

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
