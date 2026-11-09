import { DynamicModule } from "@nestjs/common";
import { CustomerModuleAsyncOptions } from "./customer.options";
export { CUSTOMER_MODULE_OPTIONS } from "./customer.options";
export type { CustomerModuleOptions, CustomerModuleAsyncOptions, } from "./customer.options";
/**
 * Phase 4 (API layer) module: controllers, services and repositories on top
 * of the Phase 3 entities. Region is a hard dependency (`requires: ['region']`
 * in the manifest) — province/regency tables are NOT created or imported here;
 * region validation runs raw queries against those well-known tables.
 */
export declare class CustomerModule {
    static registerAsync(options: CustomerModuleAsyncOptions): DynamicModule;
}
