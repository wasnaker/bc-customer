import { SetMetadata } from '@nestjs/common';

export const CUSTOMER_RESOURCE_METADATA = 'customer:resource';
export const CUSTOMER_SELF_BRANCH_METADATA = 'customer:self-branch';

/**
 * Declares which customer sub-resource a route operates on, so
 * CustomerAccessGuard can map the HTTP method to an action permission.
 */
export const CustomerResource = (resource: string) =>
  SetMetadata(CUSTOMER_RESOURCE_METADATA, resource);

/**
 * Marks a self-service endpoint whose data is always resolved from the
 * authenticated user ID. Pass a permission to require a dedicated Profile
 * capability in addition to the authenticated session.
 */
export const CustomerSelfBranch = (permission?: string) =>
  SetMetadata(CUSTOMER_SELF_BRANCH_METADATA, permission ?? true);
