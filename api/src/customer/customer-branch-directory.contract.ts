import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { BranchService } from "./services/branch.service";

export interface CustomerBranchSummary {
  id: string;
  customerId: string;
  name: string;
  isHeadOffice: boolean;
  isActive: boolean;
}

export interface CustomerBranchDirectory {
  findBranchById(id: string): Promise<CustomerBranchSummary | null>;
}

interface ModuleServiceRegistry {
  register<TService>(registration: {
    providerModuleId: string;
    contractId: string;
    version: string;
    consumers: readonly string[];
    service: TService;
  }): () => void;
}

interface ModuleLifecycleRegistry {
  registerRuntimeAdapter(
    moduleId: string,
    adapter: { activate(): void | (() => void | Promise<void>) | Promise<void | (() => void | Promise<void>)> },
  ): () => void;
}

const MODULE_SERVICE_REGISTRY = Symbol.for(
  "@wasnaker/module-runtime/service-registry",
);
const MODULE_LIFECYCLE_SERVICE = Symbol.for(
  "@wasnaker/module-runtime/lifecycle",
);

/**
 * Customer publishes its read facade only while Customer is active. The
 * lifecycle manager owns activation/deactivation and restores it after restart.
 */
@Injectable()
export class CustomerBranchDirectoryContract
  implements OnModuleInit, OnModuleDestroy
{
  private unregisterAdapter?: () => void;

  constructor(
    private readonly branches: BranchService,
    @Inject(MODULE_SERVICE_REGISTRY)
    private readonly registry: ModuleServiceRegistry,
    @Inject(MODULE_LIFECYCLE_SERVICE)
    private readonly lifecycle: ModuleLifecycleRegistry,
  ) {}

  onModuleInit(): void {
    this.unregisterAdapter = this.lifecycle.registerRuntimeAdapter("customer", {
      activate: () => this.registerContract(),
    });
  }

  onModuleDestroy(): void {
    this.unregisterAdapter?.();
    this.unregisterAdapter = undefined;
  }

  private registerContract(): () => void {
    const service: CustomerBranchDirectory = {
      findBranchById: async (id) => {
        const branch = await this.branches.findBranchById(id);
        if (!branch) return null;
        return {
          id: String(branch.id),
          customerId: String(branch.customerId),
          name: branch.name,
          isHeadOffice: branch.isHeadOffice,
          isActive: branch.isActive,
        };
      },
    };

    return this.registry.register({
      providerModuleId: "customer",
      contractId: "customer.branch-directory",
      version: "1.0.0",
      consumers: ["equipment"],
      service,
    });
  }
}
