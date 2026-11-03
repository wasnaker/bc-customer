import { DynamicModule, Module, Provider } from '@nestjs/common';

import { CustomerAccessGuard } from './security/customer-access.guard';
import {
  CUSTOMER_MODULE_OPTIONS,
  CustomerModuleAsyncOptions,
} from './customer.options';

export { CUSTOMER_MODULE_OPTIONS } from './customer.options';
export type { CustomerModuleOptions, CustomerModuleAsyncOptions } from './customer.options';

/**
 * Phase 3 (entities) module shell: entities, migrations and ULID/code hooks
 * travel with the entity classes (method-level listeners), so no subscriber
 * registration is required here. Services/controllers arrive in a later
 * phase and will be added to providers/controllers then.
 */
@Module({
  providers: [CustomerAccessGuard],
  exports: [CustomerAccessGuard],
})
export class CustomerModule {
  static registerAsync(options: CustomerModuleAsyncOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: CUSTOMER_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    };

    return {
      module: CustomerModule,
      imports: options.imports ?? [],
      providers: [optionsProvider],
    };
  }
}
