"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerModuleManifest = exports.moduleManifest = void 0;
exports.moduleManifest = {
    id: 'customer',
    version: '0.1.0',
    capabilities: ['api', 'web'],
    // region owns the province/regency tables this module's FKs point at.
    requires: ['region'],
    permissions: [
        { name: 'read:customer', description: 'Allows viewing customer module navigation and customer data' },
        { name: 'create:customer', description: 'Allows creating customers with their head-office branch' },
        { name: 'update:customer', description: 'Allows updating customer profiles' },
        { name: 'delete:customer', description: 'Allows deleting customers and their branches' },
        { name: 'read:branch', description: 'Allows viewing customer branches' },
        { name: 'create:branch', description: 'Allows creating customer branches' },
        { name: 'update:branch', description: 'Allows updating customer branches' },
        { name: 'delete:branch', description: 'Allows deleting customer branches' },
        { name: 'read:staff', description: 'Allows viewing branch staff' },
        { name: 'create:staff', description: 'Allows adding staff to branches' },
        { name: 'update:staff', description: 'Allows updating branch staff' },
        { name: 'delete:staff', description: 'Allows removing staff from branches' },
    ],
};
exports.customerModuleManifest = exports.moduleManifest;
