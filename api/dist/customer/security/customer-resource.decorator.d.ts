export declare const CUSTOMER_RESOURCE_METADATA = "customer:resource";
/**
 * Declares which customer sub-resource a route operates on, so
 * `CustomerAccessGuard` can map the HTTP method to a
 * `${action}:${resource}` permission (e.g. `update:branch`).
 * Omit on customer routes — the resource defaults to 'customer'.
 */
export declare const CustomerResource: (resource: string) => import("@nestjs/common").CustomDecorator<string>;
