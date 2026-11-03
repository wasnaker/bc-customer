"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerResource = exports.CUSTOMER_RESOURCE_METADATA = void 0;
const common_1 = require("@nestjs/common");
exports.CUSTOMER_RESOURCE_METADATA = 'customer:resource';
/**
 * Declares which customer sub-resource a route operates on, so
 * `CustomerAccessGuard` can map the HTTP method to a
 * `${action}:${resource}` permission (e.g. `update:branch`).
 * Omit on customer routes — the resource defaults to 'customer'.
 */
const CustomerResource = (resource) => (0, common_1.SetMetadata)(exports.CUSTOMER_RESOURCE_METADATA, resource);
exports.CustomerResource = CustomerResource;
