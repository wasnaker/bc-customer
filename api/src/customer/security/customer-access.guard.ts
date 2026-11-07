import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CUSTOMER_MODULE_OPTIONS,
  CustomerModuleOptions,
} from '../customer.options';
import {
  CUSTOMER_RESOURCE_METADATA,
  CUSTOMER_SELF_BRANCH_METADATA,
} from './customer-resource.decorator';
import { CUSTOMER_SCOPE_METADATA, CustomerScopeSource } from './customer-scope.decorator';
import {
  CUSTOMER_DOCUMENT_OWNER_TYPES,
  CustomerDocumentOwnerTypeEnum,
} from '../domain/customer-document';

interface AuthenticatedRequest {
  method: string;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  user?: {
    id?: number | string;
    role?: { id?: number | string } | null;
    roles?: Array<{ id?: number | string }>;
  };
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
export class CustomerAccessGuard implements CanActivate {
  constructor(
    @Optional()
    @Inject(CUSTOMER_MODULE_OPTIONS)
    private readonly options?: CustomerModuleOptions,
    private readonly reflector?: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const selfBranch = this.reflector?.getAllAndOverride<boolean>(
      CUSTOMER_SELF_BRANCH_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (selfBranch) {
      if (request.user?.id === undefined || request.user?.id === null) {
        throw new ForbiddenException();
      }
      return true;
    }

    // Polymorphic documents derive their resource permission from the stored
    // owner. CustomerScopeGuard resolves that owner and performs the complete
    // permission + scope check; do not guess "customer" before that lookup.
    const scopeSource = this.reflector?.getAllAndOverride<CustomerScopeSource>(
      CUSTOMER_SCOPE_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (scopeSource?.kind.startsWith('document-')) {
      if (request.user?.id === undefined || request.user?.id === null) {
        throw new ForbiddenException();
      }
      return true;
    }

    const action = ACTION_BY_METHOD[request.method.toUpperCase()];
    const resource = this.resolveResource(context, request);
    const permission = action ? `${action}:${resource}` : null;
    const assignedRoles = request.user?.roles?.length
      ? request.user.roles
      : request.user?.role
        ? [request.user.role]
        : [];
    const roleIds = [
      ...new Set(
        assignedRoles.map((role) => role.id).filter(
          (id): id is number | string => id !== undefined && id !== null,
        ),
      ),
    ];

    if (!permission || roleIds.length === 0 || !this.options?.authorize) {
      throw new ForbiddenException();
    }

    for (const roleId of roleIds) {
      if (await this.options.authorize(roleId, permission)) return true;
    }

    throw new ForbiddenException();
  }

  private resolveResource(
    context: ExecutionContext,
    request: AuthenticatedRequest,
  ): string {
    const metadata = this.reflector?.getAllAndOverride<string | undefined>(
      CUSTOMER_RESOURCE_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (metadata) return metadata;

    const ownerType = request.query?.ownerType ?? request.body?.ownerType;
    if (
      typeof ownerType === 'string' &&
      (CUSTOMER_DOCUMENT_OWNER_TYPES as readonly string[]).includes(ownerType)
    ) {
      return ownerType as CustomerDocumentOwnerTypeEnum;
    }

    return 'customer';
  }
}
