import type { DynamicModule } from '@nestjs/common';
import type { CustomerModuleAsyncOptions } from './customer.options';
/**
 * Standard backend module contract consumed by the host module runtime.
 * New modules should expose the same named export from their api/definition entry.
 */
export declare const moduleDefinition: {
    manifest: import("./customer.manifest").BackendModuleManifest;
    registerAsync: (options: CustomerModuleAsyncOptions) => DynamicModule;
    entities: readonly [typeof import("./customer.entities").ProvinceEntity, typeof import("./customer.entities").RegencyEntity];
    migrations: readonly [typeof import("./database/migrations").CreateCustomer1793466257948612617, typeof import("./database/migrations").AddCustomerUniquenessConstraints1793466257948612618, typeof import("./database/migrations").AddRegencyCode1793710213000000000];
    seedServices: readonly [typeof import("..").CustomerSeedService];
};
