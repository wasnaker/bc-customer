import type { DynamicModule } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

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

export interface CustomerLoginAccountInput {
  email: string; password: string; name: string; roleKey: string;
  scopeType: string; scopeId: string; assignedBy: number | null;
}
export interface CustomerBranchCreatedEvent {
  entityId: string | number;
  actorUserId: string | number;
  correlationId: string;
  data: Record<string, unknown>;
}

export interface CustomerModuleOptions {
  /** Run all Customer database writes for one use case on the same transaction manager. */
  transaction?: <T>(work: (manager: EntityManager) => Promise<T>) => Promise<T>;
  /** Persist the after-insert event using the same transaction manager as the Branch/Staff writes. */
  recordBranchCreated?: (
    manager: EntityManager,
    event: CustomerBranchCreatedEvent,
  ) => Promise<unknown>;
  createLoginAccount?: (input: CustomerLoginAccountInput) => Promise<{ id: number }>;
  deleteLoginAccount?: (userId: number) => Promise<void>;
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
