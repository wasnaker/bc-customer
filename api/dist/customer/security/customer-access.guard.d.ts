import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomerModuleOptions } from '../customer.options';
export declare class CustomerAccessGuard implements CanActivate {
    private readonly options?;
    private readonly reflector?;
    constructor(options?: CustomerModuleOptions | undefined, reflector?: Reflector | undefined);
    canActivate(context: ExecutionContext): Promise<boolean>;
    /**
     * Resource resolution order:
     * 1. `@CustomerResource('branch' | 'staff')` metadata on the route.
     * 2. Document routes: the polymorphic `ownerType` from query/body
     *    (customer/branch/staff documents are guarded by the owner's perms).
     * 3. Default: 'customer'.
     */
    private resolveResource;
}
