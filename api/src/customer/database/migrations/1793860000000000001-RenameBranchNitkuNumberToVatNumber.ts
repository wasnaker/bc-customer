import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Rename branch.nitkuNumber -> vatNumber.
 *
 * Layer domain/DTO/web sudah dipakai field `vatNumber`; kolom DB masih
 * bernama `nitkuNumber`. Migration ini menyamakan nama kolom dengan layer
 * atasnya. Idempotent: aman dijalankan berulang (IF EXISTS).
 */
export class RenameBranchNitkuNumberToVatNumber1793860000001
  implements MigrationInterface
{
  name = "RenameBranchNitkuNumberToVatNumber1793860000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasLegacyColumn = await queryRunner.hasColumn("branch", "nitkuNumber");
    const hasCurrentColumn = await queryRunner.hasColumn("branch", "vatNumber");
    if (hasLegacyColumn && !hasCurrentColumn) {
      await queryRunner.query(
        `ALTER TABLE "branch" RENAME COLUMN "nitkuNumber" TO "vatNumber"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasCurrentColumn = await queryRunner.hasColumn("branch", "vatNumber");
    const hasLegacyColumn = await queryRunner.hasColumn("branch", "nitkuNumber");
    if (hasCurrentColumn && !hasLegacyColumn) {
      await queryRunner.query(
        `ALTER TABLE "branch" RENAME COLUMN "vatNumber" TO "nitkuNumber"`,
      );
    }
  }
}