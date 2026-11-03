import { MigrationInterface, QueryRunner } from 'typeorm';
/**
 * `code` (6-char Crockford Base32) dihitung dari id langsung di database
 * memakai trigger AFTER INSERT — bukan hook TypeORM:
 * - hook `@AfterInsert` tidak andal (event.queryRunner bisa undefined saat
 *   insert via EntityManager transaksi), dan
 * - trigger bekerja untuk insert dari jalur mana pun (API, seed, panel admin).
 *
 * Rumus (I7, reversible): code = base32(((id % 32^6) × A + salt) % 32^6)
 * - A (multiplier)  = 48271 (konstanta)
 * - salt            = 1 (placeholder; nanti dibekukan per modul via Settings, I7/I8)
 * - alphabet Crockford Base32 tanpa I/L/O/U.
 */
export declare class AddCustomerCodeTriggers1793850000000000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
