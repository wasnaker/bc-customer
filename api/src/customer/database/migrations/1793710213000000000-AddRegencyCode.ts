import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRegencyCode1793710213000000000 implements MigrationInterface {
  name = 'AddRegencyCode1793710213000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "regency" ADD "code" character varying`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_regency_code" ON "regency" ("code")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_regency_code"`);
    await queryRunner.query(`ALTER TABLE "regency" DROP COLUMN "code"`);
  }
}
