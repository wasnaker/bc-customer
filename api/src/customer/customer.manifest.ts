export interface ModulePermissionDefinition {
  name: string;
  description: string;
}

export interface BackendModuleManifest {
  id: string;
  version: string;
  capabilities: readonly ('api' | 'web')[];
  permissions: readonly ModulePermissionDefinition[];
}

export const moduleManifest: BackendModuleManifest = {
  id: 'customer',
  version: '0.1.0',
  capabilities: ['api', 'web'],
  permissions: [
    { name: 'read:customer', description: 'Allows viewing Customer module navigation and data' },
    { name: 'create:customer', description: 'Allows creating provinces and regencies' },
    { name: 'update:customer', description: 'Allows updating provinces and regencies' },
    { name: 'delete:customer', description: 'Allows deleting provinces and regencies' },
  ],
};

export const customerModuleManifest = moduleManifest;
