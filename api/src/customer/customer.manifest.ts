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

export const moduleManifest: BackendModuleManifest = {
  id: 'customer',
  version: '0.1.3',
  capabilities: ['api', 'web'],
  requires: ['region'],
  scopeTypes: ['global', 'customer', 'branch'],
  permissions: [
    { name: 'read:customer', description: 'Allows viewing customer administration data' },
    { name: 'create:customer', description: 'Allows creating customers with their head-office branch' },
    { name: 'update:customer', description: 'Allows updating customer profiles' },
    { name: 'delete:customer', description: 'Allows deleting customers and their branches' },
    { name: 'read:branch', description: 'Allows viewing customer branches in the administration module' },
    { name: 'create:branch', description: 'Allows creating customer branches' },
    { name: 'update:branch', description: 'Allows updating customer branches' },
    { name: 'delete:branch', description: 'Allows deleting customer branches' },
    { name: 'read:staff', description: 'Allows viewing branch staff in the administration module' },
    { name: 'create:staff', description: 'Allows adding staff to branches' },
    { name: 'update:staff', description: 'Allows updating branch staff' },
    { name: 'delete:staff', description: 'Allows removing staff from branches' },
    { name: 'read:my-customer-company', description: 'Allows viewing the signed-in user\'s own company branch in Profile' },
    { name: 'read:my-customer-branch', description: 'Allows viewing all branches belonging to the signed-in user\'s customer in Profile' },
    { name: 'read:my-customer-staff', description: 'Allows viewing staff within the signed-in user\'s assigned customer or branch scope in Profile' },
    { name: 'update:my-customer-staff', description: 'Allows updating staff within the signed-in user\'s assigned customer or branch scope in Profile' },
  ],
  roles: [
    {
      key: 'customer-admin',
      name: 'Customer Admin',
      description: 'Administrator at the customer company / head-office scope.',
      scope: 'customer',
      permissions: ['read:customer', 'create:customer', 'update:customer', 'delete:customer', 'read:branch', 'create:branch', 'update:branch', 'delete:branch', 'read:staff', 'create:staff', 'update:staff', 'delete:staff', 'read:my-customer-company', 'read:my-customer-branch', 'read:my-customer-staff', 'update:my-customer-staff'],
    },
    {
      key: 'customer-branch-admin',
      name: 'Customer Branch Admin',
      description: 'Administrator limited to one assigned branch.',
      scope: 'branch',
      permissions: ['read:branch', 'update:branch', 'read:staff', 'create:staff', 'update:staff', 'delete:staff', 'read:my-customer-company', 'read:my-customer-staff', 'update:my-customer-staff'],
    },
    {
      key: 'customer',
      name: 'Customer',
      description: 'Standard customer staff account. Customer information is available only through its own Profile.',
      scope: 'branch',
      permissions: ['read:branch', 'read:staff', 'read:my-customer-company'],
    },
  ],
};
export const customerModuleManifest = moduleManifest;
