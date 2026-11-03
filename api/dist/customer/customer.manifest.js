"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerModuleManifest = exports.moduleManifest = void 0;
exports.moduleManifest = {
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
exports.customerModuleManifest = exports.moduleManifest;
