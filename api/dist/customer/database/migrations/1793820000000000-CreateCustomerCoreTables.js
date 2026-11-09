"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomerCoreTables1793820000000 = void 0;
/**
 * Create the bc-customer core tables: customer, branch, staff,
 * customer_document — sesuai kontrak final §7 (I1–I9 + J1–J3).
 *
 * Notes:
 * - Reversible: `down` drops only the tables created here. The legacy
 *   province/regency tables are NOT touched (they are owned by the region
 *   module in host databases).
 * - Cross-module FKs follow the OWNER table's id type: region `int`,
 *   host `user` `int`, host `file` `uuid`. Only intra-module relations
 *   (customerId, branchId) use bigint.
 * - `code` (char 6, Crockford Base32 dari id+salt) hanya di customer dan
 *   branch — staff tidak butuh code.
 * - branch.addressLine WAJIB untuk semua branch (J2).
 * - Maks 1 HO per customer: partial unique index.
 * - branch/staff region FK memakai ON DELETE RESTRICT.
 */
class CreateCustomerCoreTables1793820000000 {
    constructor() {
        this.name = 'CreateCustomerCoreTables1793820000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customer" (
        "id" bigserial NOT NULL,
        "ulid" character varying(26),
        "code" character varying(6),
        "name" character varying(190) NOT NULL,
        "userId" integer,
        "npwpNumber" character varying(20),
        "nibNumber" character varying(20),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_customer_ulid" UNIQUE ("ulid"),
        CONSTRAINT "UQ_customer_code" UNIQUE ("code"),
        CONSTRAINT "PK_customer" PRIMARY KEY ("id"),
        CONSTRAINT "FK_customer_user" FOREIGN KEY ("userId")
          REFERENCES "user" ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "branch" (
        "id" bigserial NOT NULL,
        "ulid" character varying(26),
        "code" character varying(6),
        "customerId" bigint NOT NULL,
        "name" character varying(190) NOT NULL,
        "isHeadOffice" boolean NOT NULL DEFAULT false,
        "addressLine" character varying(255) NOT NULL,
        "provinceId" integer NOT NULL,
        "cityId" integer NOT NULL,
        "postalCode" character varying(10),
        "vatNumber" character varying(24),
        "vatType" character varying(10) NOT NULL DEFAULT 'npwp',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_branch_ulid" UNIQUE ("ulid"),
        CONSTRAINT "UQ_branch_code" UNIQUE ("code"),
        CONSTRAINT "PK_branch" PRIMARY KEY ("id"),
        CONSTRAINT "FK_branch_customer" FOREIGN KEY ("customerId")
          REFERENCES "customer" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_branch_province" FOREIGN KEY ("provinceId")
          REFERENCES "province" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_branch_city" FOREIGN KEY ("cityId")
          REFERENCES "regency" ("id") ON DELETE RESTRICT
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "staff" (
        "id" bigserial NOT NULL,
        "ulid" character varying(26),
        "branchId" bigint NOT NULL,
        "name" character varying(190) NOT NULL,
        "userId" integer,
        "position" character varying(100),
        "phone" character varying(20),
        "email" character varying(190),
        "nip" character varying(50),
        "addressLine" character varying(255),
        "provinceId" integer,
        "cityId" integer,
        "photoId" uuid,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_staff_ulid" UNIQUE ("ulid"),
        CONSTRAINT "PK_staff" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_branch" FOREIGN KEY ("branchId")
          REFERENCES "branch" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_staff_user" FOREIGN KEY ("userId")
          REFERENCES "user" ("id"),
        CONSTRAINT "FK_staff_province" FOREIGN KEY ("provinceId")
          REFERENCES "province" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_staff_city" FOREIGN KEY ("cityId")
          REFERENCES "regency" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_staff_file" FOREIGN KEY ("photoId")
          REFERENCES "file" ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customer_document" (
        "id" bigserial NOT NULL,
        "ulid" character varying(26),
        "ownerType" character varying(20) NOT NULL,
        "ownerId" bigint NOT NULL,
        "type" character varying(50) NOT NULL,
        "number" character varying(50),
        "fileId" uuid NOT NULL,
        "issuedAt" date,
        "expiresAt" date,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_customer_document_ulid" UNIQUE ("ulid"),
        CONSTRAINT "PK_customer_document" PRIMARY KEY ("id"),
        CONSTRAINT "FK_customer_document_file" FOREIGN KEY ("fileId")
          REFERENCES "file" ("id")
      )
    `);
        // Indexes
        await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_branch_customerId" ON "branch" ("customerId")');
        await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_staff_branchId" ON "staff" ("branchId")');
        await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_customer_document_owner" ON "customer_document" ("ownerType", "ownerId")');
        // Unique indexes (incl. the partial head-office index)
        await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_branch_headOffice" ON "branch" ("customerId") WHERE "isHeadOffice" = true');
        await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_staff_userId" ON "staff" ("userId")');
    }
    async down(queryRunner) {
        // Only drops what `up` created; province/regency (region module) stay.
        await queryRunner.query('DROP INDEX IF EXISTS "UQ_staff_userId"');
        await queryRunner.query('DROP INDEX IF EXISTS "UQ_branch_headOffice"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_customer_document_owner"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_staff_branchId"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_branch_customerId"');
        await queryRunner.query('DROP TABLE IF EXISTS "customer_document"');
        await queryRunner.query('DROP TABLE IF EXISTS "staff"');
        await queryRunner.query('DROP TABLE IF EXISTS "branch"');
        await queryRunner.query('DROP TABLE IF EXISTS "customer"');
    }
}
exports.CreateCustomerCoreTables1793820000000 = CreateCustomerCoreTables1793820000000;
