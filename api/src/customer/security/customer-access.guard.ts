import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { CUSTOMER_MODULE_OPTIONS, CustomerModuleOptions } from '../customer.options';

interface AuthenticatedRequest {
  method: string;
  user?: { role?: { id?: number | string } };
}

const PERMISSION_BY_METHOD: Record<string, string> = {
  GET: 'read:customer',
  HEAD: 'read:customer',
  POST: 'create:customer',
  PATCH: 'update:customer',
  PUT: 'update:customer',
  DELETE: 'delete:customer',
};

@Injectable()
export class CustomerAccessGuard implements CanActivate {
  constructor(
    @Optional()
    @Inject(CUSTOMER_MODULE_OPTIONS)
    private readonly options?: CustomerModuleOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const permission = PERMISSION_BY_METHOD[request.method.toUpperCase()];
    const roleId = request.user?.role?.id;

    if (!permission || roleId === undefined || !this.options?.authorize) {
      throw new ForbiddenException();
    }

    const allowed = await this.options.authorize(roleId, permission);
    if (!allowed) throw new ForbiddenException();
    return true;
  }
}
