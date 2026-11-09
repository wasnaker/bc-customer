# Branch creation transaction boundary

Branch creation is a single Customer database use case, with external account provisioning kept outside the PostgreSQL transaction:

1. Validate Customer, Region pair, and the max-one-head-office rule.
2. Reserve the next Branch id using PostgreSQL's sequence. Sequence gaps on failed attempts are expected and harmless.
3. Provision the external login account using that reserved id as its Branch scope id.
4. Open one PostgreSQL transaction through the host-provided `transaction` adapter.
5. Insert Branch with the reserved id through `BranchRepository.create(data, manager, id)`.
6. Insert the administrator Staff record through `StaffRepository.create(data, manager)`.
7. Insert `customer.branch.afterInsert` into `module_event_outbox` through the same manager.
8. Commit the PostgreSQL transaction.

Branch and Staff repositories accept an optional TypeORM `EntityManager`. When supplied, every write and follow-up read uses the transaction-bound repository. Existing non-transactional callers retain the default injected repository.

## External account compensation

The login account and role assignment are managed by the host authentication/authorization services; they cannot participate in the Customer PostgreSQL transaction. To avoid holding a database transaction open during a network/database call to the host account service, Customer reserves the Branch sequence id first and provisions the account before opening the transaction.

If Branch insert, Staff insert, outbox insert, or transaction commit fails after the account was created, BranchService calls the host-provided account deletion adapter. The database transaction then leaves no Branch, Staff, or outbox row.

If compensation succeeds, the original failure is rethrown. If compensation also fails, an `AggregateError` reports both failures. The Branch and Staff database rows still roll back together; a failed external cleanup may leave an orphaned login account and must be surfaced operationally.

## Outbox guarantee

The Branch event is recorded only after the Branch and administrator Staff writes have succeeded, and it uses the same transaction manager. Therefore the Branch row, Staff row, and pending outbox row commit or roll back together.

The outbox publisher remains at-least-once. Consumers must deduplicate by `eventId`. The event snapshot is a minimal Branch DTO and does not include passwords or login credentials.

## Scope

This integration currently covers Branch creation. Branch update/delete lifecycle events and conversion of the existing compensation error into an operational reconciliation workflow remain separate follow-ups.
