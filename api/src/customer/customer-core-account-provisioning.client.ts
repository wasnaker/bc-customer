import { Inject, Injectable } from "@nestjs/common";

export interface CoreAccountProvisioningInput {
  moduleId: string;
  email: string;
  password: string;
  name: string;
  roleKey: string;
  scopeType: string;
  scopeId: string;
  assignedBy: number | null;
}

export interface CoreAccountProvisioning {
  create(input: CoreAccountProvisioningInput): Promise<{ id: number }>;
  remove(userId: number): Promise<void>;
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

/** Customer delegates account creation and compensation to the Core contract. */
@Injectable()
export class CustomerCoreAccountProvisioningClient {
  constructor(
    @Inject(MODULE_SERVICE_REGISTRY)
    private readonly registry: ModuleServiceRegistry,
  ) {}

  create(input: Omit<CoreAccountProvisioningInput, "moduleId">): Promise<{ id: number }> {
    const provisioning = this.registry.resolve<CoreAccountProvisioning>(
      "customer",
      "core.account-provisioning",
      "^1.0.0",
    );
    return provisioning.create({ ...input, moduleId: "customer" });
  }

  remove(userId: number): Promise<void> {
    const provisioning = this.registry.resolve<CoreAccountProvisioning>(
      "customer",
      "core.account-provisioning",
      "^1.0.0",
    );
    return provisioning.remove(userId);
  }
}
