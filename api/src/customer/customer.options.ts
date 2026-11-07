import type { DynamicModule } from '@nestjs/common';

export interface CustomerAuthorizationScope {
  type: string;
  id: string;
}

export interface CustomerAuthorizationTarget {
  /** Validated resource scope and its ancestors, resolved from module data. */
  scopes: readonly CustomerAuthorizationScope[];
}

export interface CustomerResolvedScopes {
  global: boolean;
  scopes: readonly CustomerAuthorizationScope[];
}

export interface CustomerModuleOptions {
  /** Delegate legacy permission checks to the host authorization service. */
  authorize: (
    roleId: number | string,
    permission: string,
  ) => boolean | Promise<boolean>;

  /**
   * Required by every route protected by CustomerScopeGuard.
   * No permission-only fallback is allowed when this callback is absent.
   */
  authorizeScoped?: (
    userId: number | string,
    permission: string,
    target: CustomerAuthorizationTarget,
  ) => boolean | Promise<boolean>;

  /** Resolves allowed role-bound scopes for backend list/count filtering. */
  resolveScopes?: (
    userId: number | string,
    permission: string,
  ) => CustomerResolvedScopes | Promise<CustomerResolvedScopes>;
}

export interface CustomerModuleAsyncOptions {
  imports?: DynamicModule['imports'];
  inject?: any[];
  useFactory: (...dependencies: any[]) =>
    | CustomerModuleOptions
    | Promise<CustomerModuleOptions>;
}

export const CUSTOMER_MODULE_OPTIONS = Symbol.for('@wasnaker/module-customer/options');
