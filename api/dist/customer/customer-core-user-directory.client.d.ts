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
    resolve<TService>(consumerModuleId: string, contractId: string, requiredVersion: string): TService;
}
/** Customer consumes a safe user summary without importing Core persistence. */
export declare class CustomerCoreUserDirectoryClient {
    private readonly registry;
    constructor(registry: ModuleServiceRegistry);
    findById(id: number | string): Promise<CoreUserSummary | null>;
}
export {};
