# Test Plan: Scope Authorization

Status: **required before enforcement rollout**
Related:
- [Universal architecture](./scope-authorization-architecture.md)
- [Customer implementation plan](./scope-based-edit-plan.md)

## 1. Authorization Core unit tests

| Case | Input | Expected |
|---|---|---|
| Permission and assignment same role | Role A has permission + A assignment matches | Allow |
| Permission and assignment split across roles | Role A has permission; Role B has matching assignment only | Deny |
| No permission | Assignment matches but role lacks permission | Deny |
| No assignment | Role has permission, assignment missing | Deny |
| Wrong module | Assignment moduleId differs | Deny |
| Wrong role key | Assignment roleKey differs | Deny |
| Wrong scope | Assignment scope absent from target scope path | Deny |
| Ancestor scope | customer assignment matches target containing customer ancestor | Allow |
| Explicit global admin | Core role has protected wildcard permission | Allow |
| Unknown/non-module role | No module registration and no core admin grant | Deny |
| Administrator-created custom role | Module permission + `core-role:<roleId>` assignment matching target | Allow |
| Custom role permission only | No `core-role:<roleId>` assignment | Deny |
| Custom role global assignment | `global` scope declared by module manifest and explicit assignment exists | Allow |
| Inactive role | Role inactive | Deny |
| Invalid user/role IDs | Invalid or empty identifiers | Deny |
| Assignment revoked | Assignment deleted before next request | Deny |

## 2. Customer resolver tests

- Target-less `POST /customer` is allowed only for the explicit core wildcard administrator; a customer-scoped Customer Admin cannot create another tenant.
- Customer ID resolves only an existing customer.
- Branch ID resolves branch and its actual customerId from PostgreSQL.
- Staff ID resolves staff → branch → customer.
- Document ID resolves the stored ownerType/ownerId, never the request body.
- Invalid or missing target returns deny/not-found according to endpoint contract.
- A request body attempting to change customerId/branchId cannot change the resolved authorization target.
- A staff/branch record whose parent relation is missing or inconsistent fails closed.

## 3. API security integration tests

### Vera (demo fixture; verify current IDs before use)
- Customer 16 branches 38, 39, 40, 41: permitted operations according to Customer Admin permissions.
- Customer 17 branches 42, 43, 44, 45: denied.
- Direct PATCH/DELETE with a manually substituted branch or staff ID: denied.

### Maria (demo fixture; verify current IDs before use)
- Branch 43 and staff belonging to branch 43: permitted only for manifest permissions.
- Branches 42, 44, 45 and staff belonging to them: denied.
- Branch ID and staff ID tampering in URL/query/body: denied.

### General negative cases
- Scoped role without assignment.
- Assignment exists for a role the user no longer has.
- Role permission exists but assignment belongs to another roleKey.
- Multiple roles where only one complete permission+scope pair should authorize.
- A non-admin core role without a module role is not a global bypass.
- Missing scope callback or resolver is a deny, never legacy permission-only.
- Inactive customer, branch, staff, or document owner.
- `GET /customer/me/scope` ignores client-supplied userId and resolves from authenticated user only.
- Self-service endpoint ignores client-supplied userId and resolves from authenticated user only.
- Assignment revoke takes effect on next request with the same login session.

## 4. Read isolation tests

For every list endpoint:
- SQL filtering is applied before pagination.
- total/count reflects only authorized rows.
- filters and sorting cannot escape the authorized scope.
- empty scope returns an empty list and zero count, not an unfiltered list.

For every detail endpoint:
- resource outside scope returns 404 or 403 consistently.
- direct object ID substitution does not expose the record.

For documents:
- list/read uses the actual stored owner relation.
- create checks target owner before insert.
- update/delete checks stored owner before mutation.
- changing ownerType/ownerId in the body cannot move a document across scopes.

## 5. Data migration/backfill tests

- Dry-run output identifies users with no staff, multiple staff, inactive records, multiple role assignments, invalid scope IDs, and orphan assignments.
- Backfill is idempotent.
- Customer Admin receives customer scope only from approved, validated customer mapping.
- Branch Admin and Customer receive branch scope only from their validated staff → branch relationship.
- No assignment is broadened or deleted silently.
- Unique constraint prevents duplicate assignment.
- Enforcement cannot be enabled while unresolved users remain.

## 6. Frontend regression tests

- Parent menu remains visible when an allowed child menu exists.
- Page route and menu permissions agree with the backend manifest.
- Scope endpoint only changes visibility/UX; API remains authoritative.
- Buttons and row actions are hidden when permission or scope is absent.
- A manually invoked API request is still denied even if the UI is bypassed.

## 7. Release gate

No scope enforcement deploy until:
1. Core unit tests pass.
2. Customer resolver and API negative tests pass on PostgreSQL.
3. Read list/count/detail tests pass.
4. Backfill dry-run has been reviewed and approved.
5. All affected users have a valid assignment or a documented explicit denial.
6. Global administrator bypass and revocation behavior have been verified.
