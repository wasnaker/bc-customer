export interface ModulePermissionDefinition {
    name: string;
    description: string;
}
export interface ModuleRoleDefinition {
    key: string;
    name: string;
    description: string;
    scope: 'global' | 'customer' | 'branch';
    permissions: readonly string[];
}
export interface BackendModuleManifest {
    id: string;
    version: string;
    capabilities: readonly ('api' | 'web')[];
    permissions: readonly ModulePermissionDefinition[];
    scopeTypes?: readonly string[];
    roles?: readonly ModuleRoleDefinition[];
    requires?: readonly string[];
}
export declare const moduleManifest: BackendModuleManifest;
export declare const customerModuleManifest: BackendModuleManifest;
