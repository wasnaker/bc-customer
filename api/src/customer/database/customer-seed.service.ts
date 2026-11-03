import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProvinceEntity } from '../infrastructure/persistence/relational/entities/province.entity';
import { RegencyEntity } from '../infrastructure/persistence/relational/entities/regency.entity';

import {
  PROVINCE_SEED,
  ProvinceSeedRow,
} from './seed-data/provinces.data';
import {
  REGENCY_SEED,
  RegencySeedRow,
} from './seed-data/regencies.data';

/**
 * Seed data wilayah administrasi Indonesia.
 *
 * Sumber: fityannugroho/idn-area-data (berbasis Kemendagri) — 38 provinsi,
 * 514 kab/kota (98 kota). Nama kab/kota menyertakan prefix "Kabupaten "/"Kota "
 * sesuai data resmi; field `type` diisi dari prefix tersebut. Field `code`
 * diisi kode BPS 4 digit (mis. 11.01).
 *
 * IDEMPOTENT & DETERMINISTIK:
 * - Setiap baris seed membawa `id` eksplisit, sehingga id wilayah SAMA
 *   di semua environment (aman dijadikan FK lintas modul).
 * - Province di-upsert by `isoCode` (nama ikut diperbarui bila berubah).
 * - Regency di-upsert by `(provinceId, name)`; `code` ikut diperbarui bila
 *   berbeda. Aman dijalankan berulang.
 * - Setelah seeding, sequence `province_id_seq` / `regency_id_seq`
 *   disinkronkan ke MAX(id) agar insert manual berikutnya tidak bertabrakan.
 *
 * Koordinat (latitude/longitude) tidak tersedia dari sumber ini — dibiarkan
 * NULL dan bisa diisi manual via panel admin.
 */
@Injectable()
export class CustomerSeedService {
  private readonly logger = new Logger(CustomerSeedService.name);

  constructor(
    @InjectRepository(ProvinceEntity)
    private readonly provinceRepository: Repository<ProvinceEntity>,
    @InjectRepository(RegencyEntity)
    private readonly regencyRepository: Repository<RegencyEntity>,
  ) {}

  async run(): Promise<void> {
    await this.seedProvinces();
    await this.seedRegencies();
    await this.syncSequences();
  }

  private async seedProvinces(): Promise<void> {
    const rows: ProvinceSeedRow[] = PROVINCE_SEED;

    const existing = await this.provinceRepository.find({
      select: ['id', 'isoCode', 'name'],
    });
    const byIso = new Map(
      existing
        .filter((p) => p.isoCode != null)
        .map((p) => [p.isoCode as string, p]),
    );

    let created = 0;
    let updated = 0;

    for (const row of rows) {
      const match = byIso.get(row.isoCode);
      if (!match) {
        await this.provinceRepository.insert({
          id: row.id,
          isoCode: row.isoCode,
          name: row.name,
        });
        created++;
      } else if (match.name !== row.name) {
        await this.provinceRepository.update(match.id, { name: row.name });
        updated++;
      }
    }

    this.logger.log(
      `Province seed: ${created} dibuat, ${updated} diperbarui, ${existing.length} sudah ada`,
    );
  }

  private async seedRegencies(): Promise<void> {
    const rows: RegencySeedRow[] = REGENCY_SEED;

    const provinces = await this.provinceRepository.find({
      select: ['id', 'isoCode'],
    });
    const provinceIdByIso = new Map(
      provinces
        .filter((p) => p.isoCode != null)
        .map((p) => [p.isoCode as string, p.id as number]),
    );

    const existing = await this.regencyRepository.find({
      select: ['id', 'provinceId', 'name', 'code'],
    });
    const existingByKey = new Map(
      existing.map((r) => [`${r.provinceId}:${r.name}`, r]),
    );

    const toInsert: Array<{
      id: number;
      code: string;
      provinceId: number;
      name: string;
      type: 'kabupaten' | 'kota';
    }> = [];
    let codeUpdated = 0;

    for (const row of rows) {
      const provinceId = provinceIdByIso.get(row.provinceIsoCode);
      if (!provinceId) {
        this.logger.warn(
          `Regency "${row.name}" dilewati: province isoCode ${row.provinceIsoCode} tidak ditemukan`,
        );
        continue;
      }
      const match = existingByKey.get(`${provinceId}:${row.name}`);
      if (!match) {
        toInsert.push({
          id: row.id,
          code: row.code,
          provinceId,
          name: row.name,
          type: row.type,
        });
      } else if (match.code !== row.code) {
        await this.regencyRepository.update(match.id, { code: row.code });
        codeUpdated++;
      }
    }

    for (let i = 0; i < toInsert.length; i += 200) {
      await this.regencyRepository.insert(toInsert.slice(i, i + 200));
    }

    this.logger.log(
      `Regency seed: ${toInsert.length} dibuat, ${codeUpdated} kode diperbarui, ${existing.length} sudah ada`,
    );
  }

  /**
   * Sinkronkan sequence ke MAX(id) agar insert manual (via panel admin)
   * tidak menabrak id eksplisit dari seed.
   */
  private async syncSequences(): Promise<void> {
    for (const table of ['province', 'regency']) {
      await this.provinceRepository.query(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "${table}"), 1))`,
      );
    }
  }
}
