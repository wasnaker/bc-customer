import { Inject, Injectable } from "@nestjs/common";

export interface CoreUserSummary {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  roleIds: number[];
  statusId: number | string | null;
}

export interface CoreUserDirectory {
  findById(id: number | string): Promise<CoreUserSummary | null>;
}

interface ModuleServiceRegistry {
  resolve<TService>(
    consumerModuleId: string,
    contractId: string,
    requiredVersion: string,
  ): TService;
}

const MODULE_SERVICE_REGISTRY = Symbol.for(
  "@wasnaker/module-runtime/service-registry",
);

/** Customer consumes a safe user summary without importing Core persistence. */
@Injectable()
export class CustomerCoreUserDirectoryClient {
  constructor(
    @Inject(MODULE_SERVICE_REGISTRY)
    private readonly registry: ModuleServiceRegistry,
  ) {}

  findById(id: number | string): Promise<CoreUserSummary | null> {
    const directory = this.registry.resolve<CoreUserDirectory>(
      "customer",
      "core.user-directory",
      "^1.0.0",
    );
    return directory.findById(id);
  }
}
