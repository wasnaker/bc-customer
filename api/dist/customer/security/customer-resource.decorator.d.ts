export declare const CUSTOMER_RESOURCE_METADATA = "customer:resource";
export declare const CUSTOMER_SELF_BRANCH_METADATA = "customer:self-branch";
/**
 * Declares which customer sub-resource a route operates on, so
 * CustomerAccessGuard can map the HTTP method to an action permission.
 */
export declare const CustomerResource: (resource: string) => import("@nestjs/common").CustomDecorator<string>;
/**
 * Marks a self-service endpoint whose data is always resolved from the
 * authenticated user ID. Pass a permission to require a dedicated Profile
 * capability in addition to the authenticated session.
 */
export declare const CustomerSelfBranch: (permission?: string) => import("@nestjs/common").CustomDecorator<string>;
