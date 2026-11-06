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
 * authenticated user ID. The guard still requires a valid JWT, but does not
 * require administrative customer permissions for this strictly scoped read.
 */
export const CustomerSelfBranch = () =>
  SetMetadata(CUSTOMER_SELF_BRANCH_METADATA, true);
