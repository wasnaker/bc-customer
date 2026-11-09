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

const MODULE_SERVICE_REGISTRY = Symbol.for(
  "@wasnaker/module-runtime/service-registry",
);

/**
 * Publishes a deliberately small Customer-owned read facade. Other modules
 * cannot reach Customer repositories or ORM entities through this contract.
 */
@Injectable()
export class CustomerBranchDirectoryContract
  implements OnModuleInit, OnModuleDestroy
{
  private unregister?: () => void;

  constructor(
    private readonly branches: BranchService,
    @Inject(MODULE_SERVICE_REGISTRY)
    private readonly registry: ModuleServiceRegistry,
  ) {}

  onModuleInit(): void {
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

    this.unregister = this.registry.register({
      providerModuleId: "customer",
      contractId: "customer.branch-directory",
      version: "1.0.0",
      consumers: ["equipment"],
      service,
    });
  }

  onModuleDestroy(): void {
    this.unregister?.();
    this.unregister = undefined;
  }
}
