"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCustomerUniquenessConstraints1793466257948612618 = void 0;
class AddCustomerUniquenessConstraints1793466257948612618 {
    constructor() {
        this.name = 'AddCustomerUniquenessConstraints1793466257948612618';
    }
    async up(queryRunner) {
        const duplicateProvinces = await queryRunner.query(`
      SELECT "name", COUNT(*)::int AS "count"
      FROM "province"
      GROUP BY "name"
      HAVING COUNT(*) > 1
      LIMIT 10
    `);
        if (duplicateProvinces.length > 0) {
            throw new Error('Cannot enforce unique province names: duplicate province records exist. Resolve duplicates before rerunning this migration.');
        }
        const duplicateRegencies = await queryRunner.query(`
      SELECT "provinceId", "name", COUNT(*)::int AS "count"
      FROM "regency"
      GROUP BY "provinceId", "name"
      HAVING COUNT(*) > 1
      LIMIT 10
    `);
        if (duplicateRegencies.length > 0) {
            throw new Error('Cannot enforce unique regency names per province: duplicate regency records exist. Resolve duplicates before rerunning this migration.');
        }
        await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_province_name" ON "province" ("name")');
        await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_regency_province_name" ON "regency" ("provinceId", "name")');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_province_name"');
    }
    async down(queryRunner) {
        await queryRunner.query('DROP INDEX IF EXISTS "UQ_regency_province_name"');
        await queryRunner.query('DROP INDEX IF EXISTS "UQ_province_name"');
        await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_province_name" ON "province" ("name")');
    }
}
exports.AddCustomerUniquenessConstraints1793466257948612618 = AddCustomerUniquenessConstraints1793466257948612618;
