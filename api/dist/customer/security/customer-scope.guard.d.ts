import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomerModuleOptions } from '../customer.options';
import { CustomerService } from '../services/customer.service';
import { BranchService } from '../services/branch.service';
import { StaffService } from '../services/staff.service';
import { CustomerDocumentService } from '../services/customer-document.service';
export declare class CustomerScopeGuard implements CanActivate {
    private readonly reflector;
    private readonly customers;
    private readonly branches;
    private readonly staff;
    private readonly documents;
    private readonly options?;
    constructor(reflector: Reflector, customers: CustomerService, branches: BranchService, staff: StaffService, documents: CustomerDocumentService, options?: CustomerModuleOptions | undefined);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private resolveTarget;
    private resolveDocumentOwner;
    private readParam;
}
