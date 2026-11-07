-- Idempotent customer scope backfill.
-- IMPORTANT:
-- 1. Run docs/sql/scope-assignment-audit.sql and approve its output first.
-- 2. Run the host module/permission seed so role.moduleId + role.moduleRoleKey
--    and permission ownership are registered.
-- 3. Take a PostgreSQL backup before executing this transaction.
-- 4. This script intentionally aborts if any scoped user cannot be mapped
--    unambiguously. Resolve those accounts manually before retrying.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM role
    WHERE name = 'Customer'
      AND "moduleId" = 'customer'
      AND "moduleRoleKey" = 'customer'
      AND "isActive" = TRUE
  ) OR NOT EXISTS (
    SELECT 1 FROM role
    WHERE name = 'Customer Branch Admin'
      AND "moduleId" = 'customer'
      AND "moduleRoleKey" = 'customer-branch-admin'
      AND "isActive" = TRUE
  ) OR NOT EXISTS (
    SELECT 1 FROM role
    WHERE name = 'Customer Admin'
      AND "moduleId" = 'customer'
      AND "moduleRoleKey" = 'customer-admin'
      AND "isActive" = TRUE
  ) THEN
    RAISE EXCEPTION 'Customer module role registration is incomplete; run module seed and re-audit';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "user" u
    JOIN user_roles_role ur ON ur."userId" = u.id
    JOIN role r ON r.id = ur."roleId"
    LEFT JOIN staff s ON s."userId" = u.id
    WHERE r.name IN ('Customer Admin', 'Customer Branch Admin', 'Customer')
      AND s.id IS NULL
  ) THEN
    RAISE EXCEPTION 'At least one Customer role user has no staff mapping; resolve manually before backfill';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM staff s
    JOIN user_roles_role ur ON ur."userId" = s."userId"
    JOIN role r ON r.id = ur."roleId"
    LEFT JOIN branch b ON b.id = s."branchId"
    LEFT JOIN customer c ON c.id = b."customerId"
    WHERE r.name IN ('Customer Admin', 'Customer Branch Admin', 'Customer')
      AND (b.id IS NULL OR b."isActive" = FALSE OR c.id IS NULL OR c."isActive" = FALSE)
  ) THEN
    RAISE EXCEPTION 'At least one scoped staff mapping points to an inactive or missing branch/customer';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM branch b
    JOIN customer c ON c.id = b."customerId"
    WHERE b."isHeadOffice" = TRUE
      AND b."isActive" = TRUE
      AND c."isActive" = TRUE
    GROUP BY b."customerId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'A customer has multiple active head offices; resolve before Customer Admin backfill';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "user" u
    JOIN user_roles_role ur ON ur."userId" = u.id
    JOIN role r ON r.id = ur."roleId" AND r.name = 'Customer Admin'
    WHERE NOT EXISTS (
      SELECT 1
      FROM staff s
      JOIN branch b ON b.id = s."branchId"
      JOIN customer c ON c.id = b."customerId"
      WHERE s."userId" = u.id
        AND b."isHeadOffice" = TRUE
        AND b."isActive" = TRUE
        AND c."isActive" = TRUE
    )
  ) THEN
    RAISE EXCEPTION 'A Customer Admin has no active head-office mapping; assign customer scope manually after approval';
  END IF;
END $$;

-- Standard Customer: each active staff → branch relationship.
INSERT INTO module_role_assignment
  ("userId", "moduleId", "roleKey", "scopeType", "scopeId", "assignedBy")
SELECT DISTINCT
  s."userId",
  'customer',
  'customer',
  'branch',
  s."branchId"::varchar,
  NULL
FROM staff s
JOIN branch b ON b.id = s."branchId" AND b."isActive" = TRUE
JOIN customer c ON c.id = b."customerId" AND c."isActive" = TRUE
JOIN user_roles_role ur ON ur."userId" = s."userId"
JOIN role r ON r.id = ur."roleId"
  AND r.name = 'Customer'
  AND r."moduleId" = 'customer'
  AND r."moduleRoleKey" = 'customer'
  AND r."isActive" = TRUE
WHERE s."userId" IS NOT NULL
ON CONFLICT ("moduleId", "roleKey", "userId", "scopeType", "scopeId")
DO NOTHING;

-- Customer Branch Admin: branch scope for every active staff → branch link.
INSERT INTO module_role_assignment
  ("userId", "moduleId", "roleKey", "scopeType", "scopeId", "assignedBy")
SELECT DISTINCT
  s."userId",
  'customer',
  'customer-branch-admin',
  'branch',
  s."branchId"::varchar,
  NULL
FROM staff s
JOIN branch b ON b.id = s."branchId" AND b."isActive" = TRUE
JOIN customer c ON c.id = b."customerId" AND c."isActive" = TRUE
JOIN user_roles_role ur ON ur."userId" = s."userId"
JOIN role r ON r.id = ur."roleId"
  AND r.name = 'Customer Branch Admin'
  AND r."moduleId" = 'customer'
  AND r."moduleRoleKey" = 'customer-branch-admin'
  AND r."isActive" = TRUE
WHERE s."userId" IS NOT NULL
ON CONFLICT ("moduleId", "roleKey", "userId", "scopeType", "scopeId")
DO NOTHING;

-- Customer Admin: customer scope only from an active head-office relationship.
INSERT INTO module_role_assignment
  ("userId", "moduleId", "roleKey", "scopeType", "scopeId", "assignedBy")
SELECT DISTINCT
  s."userId",
  'customer',
  'customer-admin',
  'customer',
  b."customerId"::varchar,
  NULL
FROM staff s
JOIN branch b ON b.id = s."branchId"
  AND b."isHeadOffice" = TRUE
  AND b."isActive" = TRUE
JOIN customer c ON c.id = b."customerId" AND c."isActive" = TRUE
JOIN user_roles_role ur ON ur."userId" = s."userId"
JOIN role r ON r.id = ur."roleId"
  AND r.name = 'Customer Admin'
  AND r."moduleId" = 'customer'
  AND r."moduleRoleKey" = 'customer-admin'
  AND r."isActive" = TRUE
WHERE s."userId" IS NOT NULL
ON CONFLICT ("moduleId", "roleKey", "userId", "scopeType", "scopeId")
DO NOTHING;

-- Review this result before COMMIT. It must return zero rows for all mapped
-- role/user pairs; existing valid assignments are preserved.
SELECT
  u.id AS "userId",
  r.name AS "roleName",
  r."moduleRoleKey" AS "roleKey"
FROM "user" u
JOIN user_roles_role ur ON ur."userId" = u.id
JOIN role r ON r.id = ur."roleId"
WHERE r.name IN ('Customer Admin', 'Customer Branch Admin', 'Customer')
  AND NOT EXISTS (
    SELECT 1
    FROM module_role_assignment m
    WHERE m."userId" = u.id
      AND m."moduleId" = 'customer'
      AND m."roleKey" = r."moduleRoleKey"
  );

-- If the review query above is empty and the assignment report is correct:
-- COMMIT;
-- Otherwise:
-- ROLLBACK;

ROLLBACK; -- Default safe behavior: inspect first, then explicitly change to COMMIT.
