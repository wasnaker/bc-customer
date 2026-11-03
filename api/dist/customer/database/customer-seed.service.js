"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CustomerSeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const province_entity_1 = require("../infrastructure/persistence/relational/entities/province.entity");
const regency_entity_1 = require("../infrastructure/persistence/relational/entities/regency.entity");
const provinces_data_1 = require("./seed-data/provinces.data");
const regencies_data_1 = require("./seed-data/regencies.data");
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
let CustomerSeedService = CustomerSeedService_1 = class CustomerSeedService {
    constructor(provinceRepository, regencyRepository) {
        this.provinceRepository = provinceRepository;
        this.regencyRepository = regencyRepository;
        this.logger = new common_1.Logger(CustomerSeedService_1.name);
    }
    async run() {
        await this.seedProvinces();
        await this.seedRegencies();
        await this.syncSequences();
    }
    async seedProvinces() {
        const rows = provinces_data_1.PROVINCE_SEED;
        const existing = await this.provinceRepository.find({
            select: ['id', 'isoCode', 'name'],
        });
        const byIso = new Map(existing
            .filter((p) => p.isoCode != null)
            .map((p) => [p.isoCode, p]));
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
            }
            else if (match.name !== row.name) {
                await this.provinceRepository.update(match.id, { name: row.name });
                updated++;
            }
        }
        this.logger.log(`Province seed: ${created} dibuat, ${updated} diperbarui, ${existing.length} sudah ada`);
    }
    async seedRegencies() {
        const rows = regencies_data_1.REGENCY_SEED;
        const provinces = await this.provinceRepository.find({
            select: ['id', 'isoCode'],
        });
        const provinceIdByIso = new Map(provinces
            .filter((p) => p.isoCode != null)
            .map((p) => [p.isoCode, p.id]));
        const existing = await this.regencyRepository.find({
            select: ['id', 'provinceId', 'name', 'code'],
        });
        const existingByKey = new Map(existing.map((r) => [`${r.provinceId}:${r.name}`, r]));
        const toInsert = [];
        let codeUpdated = 0;
        for (const row of rows) {
            const provinceId = provinceIdByIso.get(row.provinceIsoCode);
            if (!provinceId) {
                this.logger.warn(`Regency "${row.name}" dilewati: province isoCode ${row.provinceIsoCode} tidak ditemukan`);
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
            }
            else if (match.code !== row.code) {
                await this.regencyRepository.update(match.id, { code: row.code });
                codeUpdated++;
            }
        }
        for (let i = 0; i < toInsert.length; i += 200) {
            await this.regencyRepository.insert(toInsert.slice(i, i + 200));
        }
        this.logger.log(`Regency seed: ${toInsert.length} dibuat, ${codeUpdated} kode diperbarui, ${existing.length} sudah ada`);
    }
    /**
     * Sinkronkan sequence ke MAX(id) agar insert manual (via panel admin)
     * tidak menabrak id eksplisit dari seed.
     */
    async syncSequences() {
        for (const table of ['province', 'regency']) {
            await this.provinceRepository.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "${table}"), 1))`);
        }
    }
};
exports.CustomerSeedService = CustomerSeedService;
exports.CustomerSeedService = CustomerSeedService = CustomerSeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(province_entity_1.ProvinceEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(regency_entity_1.RegencyEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerSeedService);
