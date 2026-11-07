import { SetMetadata } from '@nestjs/common';

export const CUSTOMER_SCOPE_METADATA = 'customer:scope';

export type CustomerScopeSource =
  | { kind: 'customer-param'; param: string }
  | { kind: 'customer-lookup'; param: string }
  | { kind: 'branch-param'; param: string }
  | { kind: 'branch-lookup'; param: string }
  | { kind: 'staff-lookup'; param: string }
  | { kind: 'document-owner-body' }
  | { kind: 'document-owner-query' }
  | { kind: 'document-lookup'; param: string }
  | { kind: 'branch-list' }
  | { kind: 'staff-list' }
  | { kind: 'customer-list' }
  | { kind: 'global-create' };

/** Declares how a route target is resolved into verified module scope. */
export const CustomerScope = (source: CustomerScopeSource) =>
  SetMetadata(CUSTOMER_SCOPE_METADATA, source);
