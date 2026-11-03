import { Repository } from 'typeorm';
import { ProvinceEntity } from '../infrastructure/persistence/relational/entities/province.entity';
import { RegencyEntity } from '../infrastructure/persistence/relational/entities/regency.entity';
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
export declare class CustomerSeedService {
    private readonly provinceRepository;
    private readonly regencyRepository;
    private readonly logger;
    constructor(provinceRepository: Repository<ProvinceEntity>, regencyRepository: Repository<RegencyEntity>);
    run(): Promise<void>;
    private seedProvinces;
    private seedRegencies;
    /**
     * Sinkronkan sequence ke MAX(id) agar insert manual (via panel admin)
     * tidak menabrak id eksplisit dari seed.
     */
    private syncSequences;
}
