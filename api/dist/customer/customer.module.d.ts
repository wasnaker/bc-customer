import { DynamicModule } from '@nestjs/common';
import { CustomerModuleAsyncOptions } from './customer.options';
export { CUSTOMER_MODULE_OPTIONS } from './customer.options';
export type { CustomerModuleOptions, CustomerModuleAsyncOptions } from './customer.options';
export declare class CustomerModule {
    static registerAsync(options: CustomerModuleAsyncOptions): DynamicModule;
}
