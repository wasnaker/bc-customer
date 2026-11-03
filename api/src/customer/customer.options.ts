import type { DynamicModule } from '@nestjs/common';

export interface CustomerModuleOptions {
  /** Delegate permission decisions to the host's authorization service. */
  authorize: (
    roleId: number | string,
    permission: string,
  ) => boolean | Promise<boolean>;
}

export interface CustomerModuleAsyncOptions {
  imports?: DynamicModule['imports'];
  inject?: any[];
  useFactory: (...dependencies: any[]) =>
    | CustomerModuleOptions
    | Promise<CustomerModuleOptions>;
}

export const CUSTOMER_MODULE_OPTIONS = Symbol.for('@wasnaker/module-customer/options');
