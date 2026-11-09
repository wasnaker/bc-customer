"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSelfBranch = exports.CustomerResource = exports.CUSTOMER_SELF_BRANCH_METADATA = exports.CUSTOMER_RESOURCE_METADATA = void 0;
const common_1 = require("@nestjs/common");
exports.CUSTOMER_RESOURCE_METADATA = 'customer:resource';
exports.CUSTOMER_SELF_BRANCH_METADATA = 'customer:self-branch';
/**
 * Declares which customer sub-resource a route operates on, so
 * CustomerAccessGuard can map the HTTP method to an action permission.
 */
const CustomerResource = (resource) => (0, common_1.SetMetadata)(exports.CUSTOMER_RESOURCE_METADATA, resource);
exports.CustomerResource = CustomerResource;
/**
 * Marks a self-service endpoint whose data is always resolved from the
 * authenticated user ID. Pass a permission to require a dedicated Profile
 * capability in addition to the authenticated session.
 */
const CustomerSelfBranch = (permission) => (0, common_1.SetMetadata)(exports.CUSTOMER_SELF_BRANCH_METADATA, permission ?? true);
exports.CustomerSelfBranch = CustomerSelfBranch;
