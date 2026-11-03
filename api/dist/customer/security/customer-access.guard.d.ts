import { CanActivate, ExecutionContext } from '@nestjs/common';
import { CustomerModuleOptions } from '../customer.options';
export declare class CustomerAccessGuard implements CanActivate {
    private readonly options?;
    constructor(options?: CustomerModuleOptions | undefined);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
