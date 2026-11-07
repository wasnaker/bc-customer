import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CUSTOMER_MODULE_OPTIONS,
  CustomerAuthorizationTarget,
  CustomerModuleOptions,
} from '../customer.options';
import { CustomerService } from '../services/customer.service';
import { BranchService } from '../services/branch.service';
import { StaffService } from '../services/staff.service';
import { CustomerDocumentService } from '../services/customer-document.service';
import { CustomerDocumentOwnerTypeEnum } from '../domain/customer-document';
import { CUSTOMER_SELF_BRANCH_METADATA } from './customer-resource.decorator';
import {
  CUSTOMER_SCOPE_METADATA,
  CustomerScopeSource,
} from './customer-scope.decorator';

interface ScopedRequest {
  method: string;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  user?: { id?: number | string };
  customerAuthorizationScope?: {
    global: boolean;
    customerIds: string[];
    branchIds: string[];
  };
}

interface ResolvedCustomerTarget {
  target: CustomerAuthorizationTarget;
  resource: string;
  branch?: { id: string; customerId: string; isHeadOffice: boolean };
}

const ACTION_BY_METHOD: Record<string, string> = {
  GET: 'read',
  HEAD: 'read',
  POST: 'create',
  PATCH: 'update',
  PUT: 'update',
  DELETE: 'delete',
};

@Injectable()
export class CustomerScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly customers: CustomerService,
    private readonly branches: BranchService,
    private readonly staff: StaffService,
    private readonly documents: CustomerDocumentService,
    @Optional()
    @Inject(CUSTOMER_MODULE_OPTIONS)
    private readonly options?: CustomerModuleOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ScopedRequest>();
    const selfBranch = this.reflector.getAllAndOverride<boolean>(
      CUSTOMER_SELF_BRANCH_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (selfBranch) return true;

    const source = this.reflector.getAllAndOverride<CustomerScopeSource>(
      CUSTOMER_SCOPE_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (!source) return true;

    const userId = request.user?.id;
    if (userId === undefined || userId === null) {
      throw new ForbiddenException();
    }
    if (
      source.kind === 'branch-list' ||
      source.kind === 'staff-list' ||
      source.kind === 'customer-list'
    ) {
      if (!this.options?.resolveScopes) {
        throw new ForbiddenException('Scoped read authorization is not configured');
      }
      const resource =
        source.kind === 'branch-list'
          ? 'branch'
          : source.kind === 'staff-list'
            ? 'staff'
            : 'customer';
      const resolvedScopes = await this.options.resolveScopes(
        userId,
        `read:${resource}`,
      );
      request.customerAuthorizationScope = {
        global: resolvedScopes.global,
        customerIds: resolvedScopes.scopes
          .filter((scope) => scope.type === 'customer')
          .map((scope) => String(scope.id)),
        branchIds: resolvedScopes.scopes
          .filter((scope) => scope.type === 'branch')
          .map((scope) => String(scope.id)),
      };
      return true;
    }

    if (!this.options?.authorizeScoped) {
      throw new ForbiddenException('Scoped authorization is not configured');
    }

    const resolved = await this.resolveTarget(source, request);
    const action = ACTION_BY_METHOD[request.method.toUpperCase()];
    const permission = action ? `${action}:${resolved.resource}` : null;
    if (!permission) throw new ForbiddenException();

    const allowed = await this.options.authorizeScoped(
      userId,
      permission,
      resolved.target,
    );
    if (!allowed) throw new ForbiddenException();

    // A document may not be moved into a different owner scope merely by
    // changing ownerType/ownerId in the update payload. Authorize both the
    // stored owner and the requested destination before the service mutates.
    if (
      source.kind === 'document-lookup' &&
      (request.body?.ownerType !== undefined ||
        request.body?.ownerId !== undefined)
    ) {
      const document = await this.documents.findDocumentById(
        this.readParam(request, source.param),
      );
      if (!document) throw new NotFoundException();
      const destinationOwnerType = (request.body.ownerType ??
        document.ownerType) as CustomerDocumentOwnerTypeEnum;
      const destinationOwnerId = String(
        request.body.ownerId ?? document.ownerId,
      );
      const destination = await this.resolveDocumentOwner(
        destinationOwnerType,
        destinationOwnerId,
      );
      const destinationPermission = `${action}:${destination.resource}`;
      const canMoveDocument = await this.options.authorizeScoped(
        userId,
        destinationPermission,
        destination.target,
      );
      if (!canMoveDocument) throw new ForbiddenException();
    }

    // Changing the head-office marker is a customer-level operation. A
    // branch-scoped administrator must not promote their own branch.
    if (
      resolved.branch &&
      request.body?.isHeadOffice !== undefined &&
      Boolean(request.body.isHeadOffice) !== resolved.branch.isHeadOffice
    ) {
      const customerOnlyTarget: CustomerAuthorizationTarget = {
        scopes: [{ type: 'customer', id: resolved.branch.customerId }],
      };
      const canChangeHeadOffice = await this.options.authorizeScoped(
        userId,
        permission,
        customerOnlyTarget,
      );
      if (!canChangeHeadOffice) throw new ForbiddenException();
    }

    return true;
  }

  private async resolveTarget(
    source: CustomerScopeSource,
    request: ScopedRequest,
  ): Promise<ResolvedCustomerTarget> {
    switch (source.kind) {
      case 'customer-param':
      case 'customer-lookup': {
        const id = this.readParam(request, source.param);
        const customer = await this.customers.findCustomerById(id);
        if (!customer) throw new NotFoundException();
        return {
          resource: 'customer',
          target: { scopes: [{ type: 'customer', id: String(customer.id) }] },
        };
      }

      case 'branch-param':
      case 'branch-lookup': {
        const id = this.readParam(request, source.param);
        const branch = await this.branches.findBranchById(id);
        if (!branch) throw new NotFoundException();
        const customer = await this.customers.findCustomerById(
          branch.customerId,
        );
        if (!customer) throw new NotFoundException();
        return {
          resource: 'branch',
          branch: {
            id: String(branch.id),
            customerId: String(branch.customerId),
            isHeadOffice: Boolean(branch.isHeadOffice),
          },
          target: {
            scopes: [
              { type: 'branch', id: String(branch.id) },
              { type: 'customer', id: String(customer.id) },
            ],
          },
        };
      }

      case 'staff-lookup': {
        const id = this.readParam(request, source.param);
        const staff = await this.staff.findStaffById(id);
        if (!staff) throw new NotFoundException();
        const branch = await this.branches.findBranchById(staff.branchId);
        if (!branch) throw new NotFoundException();
        const customer = await this.customers.findCustomerById(
          branch.customerId,
        );
        if (!customer) throw new NotFoundException();
        return {
          resource: 'staff',
          target: {
            scopes: [
              { type: 'branch', id: String(branch.id) },
              { type: 'customer', id: String(customer.id) },
            ],
          },
        };
      }

      case 'document-owner-body':
      case 'document-owner-query': {
        const input =
          source.kind === 'document-owner-body'
            ? request.body
            : request.query;
        const ownerType = input?.ownerType;
        const ownerId = input?.ownerId;
        if (typeof ownerType !== 'string' || ownerId === undefined) {
          throw new NotFoundException();
        }
        return this.resolveDocumentOwner(
          ownerType as CustomerDocumentOwnerTypeEnum,
          String(ownerId),
        );
      }

      case 'document-lookup': {
        const id = this.readParam(request, source.param);
        const document = await this.documents.findDocumentById(id);
        if (!document) throw new NotFoundException();
        return this.resolveDocumentOwner(
          document.ownerType,
          String(document.ownerId),
        );
      }

      default:
        throw new ForbiddenException('Unsupported customer scope source');
    }
  }

  private async resolveDocumentOwner(
    ownerType: CustomerDocumentOwnerTypeEnum,
    ownerId: string,
  ): Promise<ResolvedCustomerTarget> {
    if (ownerType === CustomerDocumentOwnerTypeEnum.CUSTOMER) {
      const customer = await this.customers.findCustomerById(ownerId);
      if (!customer) throw new NotFoundException();
      return {
        resource: 'customer',
        target: { scopes: [{ type: 'customer', id: String(customer.id) }] },
      };
    }
    if (ownerType === CustomerDocumentOwnerTypeEnum.BRANCH) {
      return this.resolveTarget(
        { kind: 'branch-lookup', param: '__ownerId' },
        { method: 'GET', params: { __ownerId: ownerId } },
      );
    }
    if (ownerType === CustomerDocumentOwnerTypeEnum.STAFF) {
      return this.resolveTarget(
        { kind: 'staff-lookup', param: '__ownerId' },
        { method: 'GET', params: { __ownerId: ownerId } },
      );
    }
    throw new NotFoundException();
  }

  private readParam(request: ScopedRequest, name: string): string {
    const value = request.params?.[name];
    if (!value || !/^\d+$/.test(value)) throw new NotFoundException();
    return value;
  }
}
