import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CUSTOMER_MODULE_OPTIONS, CustomerModuleOptions } from '../customer.options';
import { CUSTOMER_RESOURCE_METADATA } from './customer-resource.decorator';
import {
  CUSTOMER_DOCUMENT_OWNER_TYPES,
  CustomerDocumentOwnerTypeEnum,
} from '../domain/customer-document';

interface AuthenticatedRequest {
  method: string;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  user?: {
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
    const action = ACTION_BY_METHOD[request.method.toUpperCase()];
    const resource = this.resolveResource(context, request);
    const permission = action ? `${action}:${resource}` : null;
    const roleIds = [
      ...new Set(
        [
          ...(request.user?.roles ?? []).map((role) => role.id),
          request.user?.role?.id,
        ].filter(
          (id): id is number | string => id !== undefined && id !== null,
        ),
      ),
    ];

    if (!permission || roleIds.length === 0 || !this.options?.authorize) {
      throw new ForbiddenException();
    }

    // Multirole users receive the union of permissions from every assigned
    // central role. Checking only the legacy singular role silently denied
    // users whose required permission belonged to another assigned role.
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
