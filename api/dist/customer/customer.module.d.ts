import { DynamicModule } from '@nestjs/common';
import { CustomerModuleAsyncOptions } from './customer.options';
export { CUSTOMER_MODULE_OPTIONS } from './customer.options';
export type { CustomerModuleOptions, CustomerModuleAsyncOptions } from './customer.options';
/**
 * Phase 3 (entities) module shell: entities, migrations and ULID/code hooks
 * travel with the entity classes (method-level listeners), so no subscriber
 * registration is required here. Services/controllers arrive in a later
 * phase and will be added to providers/controllers then.
 */
export declare class CustomerModule {
    static registerAsync(options: CustomerModuleAsyncOptions): DynamicModule;
}
