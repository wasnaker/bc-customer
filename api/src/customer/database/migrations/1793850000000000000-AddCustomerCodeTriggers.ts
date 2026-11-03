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
export class AddCustomerCodeTriggers1793850000000000000
  implements MigrationInterface
{
  name = 'AddCustomerCodeTriggers1793850000000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "bc_customer_code6"(value bigint, salt bigint)
      RETURNS text AS $fn$
      DECLARE
        alphabet CONSTANT text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
        modulus CONSTANT bigint := 1073741824; -- 32^6
        n bigint;
        result text := '';
        i int;
      BEGIN
        -- Modulo sebelum perkalian agar aman dari overflow bigint.
        n := (((value % modulus) * 48271) + salt) % modulus;
        FOR i IN 1..6 LOOP
          result := substr(alphabet, (n % 32)::int + 1, 1) || result;
          n := n div 32;
        END LOOP;
        RETURN result;
      END;
      $fn$ LANGUAGE plpgsql IMMUTABLE;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "bc_customer_assign_code"() RETURNS trigger AS $fn$
      BEGIN
        IF NEW."code" IS NULL THEN
          UPDATE "customer"
          SET "code" = "bc_customer_code6"(NEW."id", 1)
          WHERE "id" = NEW."id";
        END IF;
        RETURN NEW;
      END;
      $fn$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(`
      CREATE TRIGGER "trg_customer_code"
      AFTER INSERT ON "customer"
      FOR EACH ROW EXECUTE FUNCTION "bc_customer_assign_code"();
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "bc_branch_assign_code"() RETURNS trigger AS $fn$
      BEGIN
        IF NEW."code" IS NULL THEN
          UPDATE "branch"
          SET "code" = "bc_customer_code6"(NEW."id", 1)
          WHERE "id" = NEW."id";
        END IF;
        RETURN NEW;
      END;
      $fn$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(`
      CREATE TRIGGER "trg_branch_code"
      AFTER INSERT ON "branch"
      FOR EACH ROW EXECUTE FUNCTION "bc_branch_assign_code"();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TRIGGER IF EXISTS "trg_branch_code" ON "branch"');
    await queryRunner.query('DROP TRIGGER IF EXISTS "trg_customer_code" ON "customer"');
    await queryRunner.query('DROP FUNCTION IF EXISTS "bc_branch_assign_code"');
    await queryRunner.query('DROP FUNCTION IF EXISTS "bc_customer_assign_code"');
    await queryRunner.query('DROP FUNCTION IF EXISTS "bc_customer_code6"');
  }
}
