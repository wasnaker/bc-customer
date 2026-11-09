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
  entityId: string | number | bigint;
  actorUserId: string | number | bigint;
  correlationId: string;
  data: Record<string, unknown>;
}

export interface CustomerBranchChangedEvent {
  entityId: string | number | bigint;
  actorUserId?: string | number | bigint | null;
  correlationId: string;
  data: Record<string, unknown>;
}

export interface CustomerModuleOptions {
  /** Host lifecycle gate; protected routes are unavailable while Customer is inactive. */
  isModuleActive?: () => boolean | Promise<boolean>;

  /** Run all Customer database writes for one use case on the same transaction manager. */
  transaction?: <T>(work: (manager: EntityManager) => Promise<T>) => Promise<T>;
  /** Persist the after-insert event using the same transaction manager as the Branch/Staff writes. */
  recordBranchCreated?: (
    manager: EntityManager,
    event: CustomerBranchCreatedEvent,
  ) => Promise<unknown>;
  /** Persist update/delete events in the same transaction as the Branch write. */
  recordBranchUpdated?: (
    manager: EntityManager,
    event: CustomerBranchChangedEvent,
  ) => Promise<unknown>;
  recordBranchDeleted?: (
    manager: EntityManager,
    event: CustomerBranchChangedEvent,
  ) => Promise<unknown>;
  createLoginAccount?: (input: CustomerLoginAccountInput) => Promise<{ id: number }>;
  deleteLoginAccount?: (userId: number) => Promise<void>;
  /** Legacy Core-Role-only check. Module Roles must use authorizeScoped or resolveScopes. */
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
