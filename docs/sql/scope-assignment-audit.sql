-- Scope assignment preflight for bc-customer.
-- Run on the target PostgreSQL database after the latest module manifest
-- seed has completed. This file is READ-ONLY.

-- 1. Verify module role ownership was registered by ModulePermissionSeedService.
SELECT r.id, r.name, r."moduleId", r."moduleRoleKey", r."isActive"
FROM role r
WHERE r.name IN ('Customer Admin', 'Customer Branch Admin', 'Customer')
ORDER BY r.name;

-- 2. Users with Customer module roles but no linked staff record.
-- These users cannot receive a branch scope automatically.
SELECT
  u.id,
  u."firstName",
  u."lastName",
  string_agg(DISTINCT r.name, ', ' ORDER BY r.name) AS roles
FROM "user" u
JOIN user_roles_role ur ON ur."userId" = u.id
JOIN role r ON r.id = ur."roleId"
LEFT JOIN staff s ON s."userId" = u.id
WHERE r.name IN ('Customer Admin', 'Customer Branch Admin', 'Customer')
  AND s.id IS NULL
GROUP BY u.id, u."firstName", u."lastName"
ORDER BY u.id;

-- 3. Users with more than one staff/branch relationship.
-- Multiple rows are valid only when each relationship is intentionally assigned.
SELECT
  s."userId",
  COUNT(DISTINCT s.id) AS staff_count,
  COUNT(DISTINCT s."branchId") AS branch_count,
  array_agg(DISTINCT s."branchId" ORDER BY s."branchId") AS branch_ids
FROM staff s
JOIN user_roles_role ur ON ur."userId" = s."userId"
JOIN role r ON r.id = ur."roleId"
WHERE r.name IN ('Customer Admin', 'Customer Branch Admin', 'Customer')
GROUP BY s."userId"
HAVING COUNT(DISTINCT s.id) > 1 OR COUNT(DISTINCT s."branchId") > 1
ORDER BY s."userId";

-- 4. Branches whose customer is missing or inactive.
SELECT b.id, b."customerId", b.name, b."isActive"
FROM branch b
LEFT JOIN customer c ON c.id = b."customerId"
WHERE c.id IS NULL OR c."isActive" = FALSE;

-- 5. Customers with more than one active head office. Backfill must stop
-- until these records are reconciled.
SELECT
  b."customerId",
  COUNT(*) AS head_office_count,
  array_agg(b.id ORDER BY b.id) AS branch_ids
FROM branch b
JOIN customer c ON c.id = b."customerId"
WHERE b."isHeadOffice" = TRUE
  AND b."isActive" = TRUE
  AND c."isActive" = TRUE
GROUP BY b."customerId"
HAVING COUNT(*) > 1
ORDER BY b."customerId";

-- 6. Customer Admin users who have no active head-office relationship.
-- They require explicit manual customer-scope assignment with approval.
SELECT
  u.id,
  u."firstName",
  u."lastName"
FROM "user" u
JOIN user_roles_role ur ON ur."userId" = u.id
JOIN role r ON r.id = ur."roleId"
WHERE r.name = 'Customer Admin'
  AND NOT EXISTS (
    SELECT 1
    FROM staff s
    JOIN branch b ON b.id = s."branchId"
    JOIN customer c ON c.id = b."customerId"
    WHERE s."userId" = u.id
      AND b."isHeadOffice" = TRUE
      AND b."isActive" = TRUE
      AND c."isActive" = TRUE
  )
ORDER BY u.id;

-- 7. Existing assignments for the three Customer module roles.
SELECT
  m."userId",
  m."roleKey",
  m."scopeType",
  m."scopeId",
  m."assignedBy",
  m."createdAt"
FROM module_role_assignment m
WHERE m."moduleId" = 'customer'
ORDER BY m."userId", m."roleKey", m."scopeType", m."scopeId";

-- 8. Acceptance accounts from the current plan (verify IDs before use).
SELECT
  m."userId",
  m."roleKey",
  m."scopeType",
  m."scopeId"
FROM module_role_assignment m
WHERE m."moduleId" = 'customer'
  AND m."userId" IN (39, 44)
ORDER BY m."userId", m."roleKey", m."scopeType", m."scopeId";

-- 9. Customer-scoped users whose assignments do not match any current staff
-- branch/customer relationship. Review before revoking anything.
SELECT DISTINCT
  m."userId",
  m."roleKey",
  m."scopeType",
  m."scopeId"
FROM module_role_assignment m
WHERE m."moduleId" = 'customer'
  AND (
    (m."scopeType" = 'branch' AND NOT EXISTS (
      SELECT 1 FROM staff s
      WHERE s."userId" = m."userId"
        AND s."branchId"::varchar = m."scopeId"
    ))
    OR
    (m."scopeType" = 'customer' AND NOT EXISTS (
      SELECT 1
      FROM staff s
      JOIN branch b ON b.id = s."branchId"
      WHERE s."userId" = m."userId"
        AND b."customerId"::varchar = m."scopeId"
        AND b."isHeadOffice" = TRUE
    ))
  )
ORDER BY m."userId", m."roleKey";
