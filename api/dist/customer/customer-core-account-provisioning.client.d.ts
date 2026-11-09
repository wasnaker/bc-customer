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
    create(input: CoreAccountProvisioningInput): Promise<{
        id: number;
    }>;
    remove(userId: number): Promise<void>;
}
interface ModuleServiceRegistry {
    resolve<TService>(consumerModuleId: string, contractId: string, requiredVersion: string): TService;
}
/** Customer delegates account creation and compensation to the Core contract. */
export declare class CustomerCoreAccountProvisioningClient {
    private readonly registry;
    constructor(registry: ModuleServiceRegistry);
    create(input: Omit<CoreAccountProvisioningInput, "moduleId">): Promise<{
        id: number;
    }>;
    remove(userId: number): Promise<void>;
}
export {};
