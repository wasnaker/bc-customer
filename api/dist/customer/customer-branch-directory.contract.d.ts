import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
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
    registerRuntimeAdapter(moduleId: string, adapter: {
        activate(): void | (() => void | Promise<void>) | Promise<void | (() => void | Promise<void>)>;
    }): () => void;
}
/**
 * Customer publishes its read facade only while Customer is active. The
 * lifecycle manager owns activation/deactivation and restores it after restart.
 */
export declare class CustomerBranchDirectoryContract implements OnModuleInit, OnModuleDestroy {
    private readonly branches;
    private readonly registry;
    private readonly lifecycle;
    private unregisterAdapter?;
    constructor(branches: BranchService, registry: ModuleServiceRegistry, lifecycle: ModuleLifecycleRegistry);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private registerContract;
}
export {};
