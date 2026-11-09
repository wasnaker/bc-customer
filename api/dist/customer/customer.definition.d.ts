import type { DynamicModule } from '@nestjs/common';
import type { CustomerModuleAsyncOptions } from './customer.options';
/**
 * Standard backend module contract consumed by the host module runtime.
 * New modules should expose the same named export from their api/definition entry.
 */
export declare const moduleDefinition: {
    manifest: import("./customer.manifest").BackendModuleManifest;
    registerAsync: (options: CustomerModuleAsyncOptions) => DynamicModule;
    entities: readonly [typeof import("./customer.entities").CustomerEntity, typeof import("./customer.entities").BranchEntity, typeof import("./customer.entities").StaffEntity, typeof import("./customer.entities").CustomerDocumentEntity];
    migrations: readonly [typeof import("./database/migrations").CreateCustomerCoreTables1793820000000, typeof import("./database/migrations").AddCustomerCodeTriggers1793850000000, typeof import("./database/migrations").RenameBranchNitkuNumberToVatNumber1793860000001, typeof import("./database/migrations").AddCustomerModuleRoles1793900000001, typeof import("./database/migrations").RestrictCustomerMenuToCustomerAdmins1794000000000000];
    seedServices: readonly [typeof import("./database/seeds/demo-data/customer-demo-data.seed.service").CustomerDemoDataSeedService];
};
