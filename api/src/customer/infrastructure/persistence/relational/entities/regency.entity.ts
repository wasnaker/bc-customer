import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { ProvinceEntity } from './province.entity';

@Index('UQ_regency_province_name', ['provinceId', 'name'], { unique: true })
@Entity({
  name: 'regency',
})
export class RegencyEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: Number })
  provinceId: number;

  @ManyToOne(() => ProvinceEntity, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'provinceId' })
  province?: ProvinceEntity;

  @Index()
  @Column({ type: String, length: 190 })
  name: string;

  /** Kode BPS 4 digit, mis. 11.01 */
  @Column({ type: String, unique: true, nullable: true })
  code: string | null;

  @Column({ type: String, default: 'kabupaten' })
  type: string;

  @Column({ type: Boolean, default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}