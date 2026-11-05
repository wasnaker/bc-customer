import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerModuleRoles1793900000001 implements MigrationInterface {
  name = "AddCustomerModuleRoles1793900000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert roles 3, 4, 5 if they don't exist. 
    // We use explicit IDs to match the upcoming SQL seeder update.
    await queryRunner.query(`
      INSERT INTO "role" ("id", "name") 
      VALUES 
        (3, 'Customer Admin'),
        (4, 'Branch Admin'),
        (5, 'Customer')
      ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name"
    `);
    
    // Sync sequence if necessary (Postgres specific)
    await queryRunner.query(`SELECT setval('role_id_seq', (SELECT MAX(id) FROM "role"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "role" WHERE "id" IN (3, 4, 5)`);
  }
}
