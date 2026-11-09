"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerScope = exports.CUSTOMER_SCOPE_METADATA = void 0;
const common_1 = require("@nestjs/common");
exports.CUSTOMER_SCOPE_METADATA = 'customer:scope';
/** Declares how a route target is resolved into verified module scope. */
const CustomerScope = (source) => (0, common_1.SetMetadata)(exports.CUSTOMER_SCOPE_METADATA, source);
exports.CustomerScope = CustomerScope;
