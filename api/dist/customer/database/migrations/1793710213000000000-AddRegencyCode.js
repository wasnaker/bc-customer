"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRegencyCode1793710213000000000 = void 0;
class AddRegencyCode1793710213000000000 {
    constructor() {
        this.name = 'AddRegencyCode1793710213000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "regency" ADD "code" character varying`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_regency_code" ON "regency" ("code")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."UQ_regency_code"`);
        await queryRunner.query(`ALTER TABLE "regency" DROP COLUMN "code"`);
    }
}
exports.AddRegencyCode1793710213000000000 = AddRegencyCode1793710213000000000;
