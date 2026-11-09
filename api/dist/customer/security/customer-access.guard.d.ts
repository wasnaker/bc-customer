import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomerModuleOptions } from '../customer.options';
export declare class CustomerAccessGuard implements CanActivate {
    private readonly options?;
    private readonly reflector?;
    constructor(options?: CustomerModuleOptions | undefined, reflector?: Reflector | undefined);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private resolveResource;
}
