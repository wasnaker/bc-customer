"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameBranchNitkuNumberToVatNumber1793860000001 = void 0;
/**
 * Rename branch.nitkuNumber -> vatNumber.
 *
 * Layer domain/DTO/web sudah dipakai field `vatNumber`; kolom DB masih
 * bernama `nitkuNumber`. Migration ini menyamakan nama kolom dengan layer
 * atasnya. Idempotent: aman dijalankan berulang (IF EXISTS).
 */
class RenameBranchNitkuNumberToVatNumber1793860000001 {
    constructor() {
        this.name = "RenameBranchNitkuNumberToVatNumber1793860000001";
    }
    async up(queryRunner) {
        const hasLegacyColumn = await queryRunner.hasColumn("branch", "nitkuNumber");
        const hasCurrentColumn = await queryRunner.hasColumn("branch", "vatNumber");
        if (hasLegacyColumn && !hasCurrentColumn) {
            await queryRunner.query(`ALTER TABLE "branch" RENAME COLUMN "nitkuNumber" TO "vatNumber"`);
        }
    }
    async down(queryRunner) {
        const hasCurrentColumn = await queryRunner.hasColumn("branch", "vatNumber");
        const hasLegacyColumn = await queryRunner.hasColumn("branch", "nitkuNumber");
        if (hasCurrentColumn && !hasLegacyColumn) {
            await queryRunner.query(`ALTER TABLE "branch" RENAME COLUMN "vatNumber" TO "nitkuNumber"`);
        }
    }
}
exports.RenameBranchNitkuNumberToVatNumber1793860000001 = RenameBranchNitkuNumberToVatNumber1793860000001;
