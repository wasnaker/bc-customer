export declare const CUSTOMER_SCOPE_METADATA = "customer:scope";
export type CustomerScopeSource = {
    kind: 'customer-param';
    param: string;
} | {
    kind: 'customer-lookup';
    param: string;
} | {
    kind: 'branch-param';
    param: string;
    permissionResource?: string;
} | {
    kind: 'branch-lookup';
    param: string;
    permissionResource?: string;
} | {
    kind: 'staff-lookup';
    param: string;
    permissionResource?: string;
} | {
    kind: 'document-owner-body';
} | {
    kind: 'document-owner-query';
} | {
    kind: 'document-lookup';
    param: string;
} | {
    kind: 'branch-list';
} | {
    kind: 'staff-list';
    permissionResource?: string;
} | {
    kind: 'customer-list';
} | {
    kind: 'global-create';
};
/** Declares how a route target is resolved into verified module scope. */
export declare const CustomerScope: (source: CustomerScopeSource) => import("@nestjs/common").CustomDecorator<string>;
