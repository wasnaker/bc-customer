import { DataSource } from "typeorm";
/**
 * Seeds the demo dataset (customers, branches, staff and their linked host
 * user accounts) with primary keys preserved exactly — including id gaps —
 * so a reseed always converges to the same record set and order.
 *
 * The current demo dataset has one appointed staff account per branch:
 * - every demo staff account receives Customer at its branch scope;
 * - every current branch staff account also receives Customer Branch Admin;
 * - the current head-office staff account also receives Customer Admin
 *   at its customer scope.
 *
 * The demo accounts also carry the same role set in the canonical
 * `user_roles_role` relation so the admin panel shows them consistently:
 * - Customer Admin (3)          -> Customer Admin + Customer Branch Admin + Customer
 * - Customer Branch Admin (4)   -> Customer Branch Admin + Customer
 * - Customer (5)                -> Customer
 *
 * This is demo-data appointment only. Staff created later receive Customer
 * only by default; administrative roles must be assigned explicitly.
 * Core user.roleId values are preserved by the SQL dataset.
 */
export declare class CustomerDemoDataSeedService {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    run(): Promise<void>;
}
