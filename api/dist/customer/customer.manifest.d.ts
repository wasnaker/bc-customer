export interface ModulePermissionDefinition {
    name: string;
    description: string;
}
export interface BackendModuleManifest {
    id: string;
    version: string;
    capabilities: readonly ('api' | 'web')[];
    permissions: readonly ModulePermissionDefinition[];
    /** Hard dependencies on other modules (by manifest id). */
    requires?: readonly string[];
}
export declare const moduleManifest: BackendModuleManifest;
export declare const customerModuleManifest: BackendModuleManifest;
