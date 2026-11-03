"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDocumentEntity = exports.StaffEntity = exports.BranchEntity = exports.CustomerEntity = exports.moduleEntities = exports.CUSTOMER_ENTITIES = void 0;
const branch_entity_1 = require("./infrastructure/persistence/relational/entities/branch.entity");
Object.defineProperty(exports, "BranchEntity", { enumerable: true, get: function () { return branch_entity_1.BranchEntity; } });
const customer_document_entity_1 = require("./infrastructure/persistence/relational/entities/customer-document.entity");
Object.defineProperty(exports, "CustomerDocumentEntity", { enumerable: true, get: function () { return customer_document_entity_1.CustomerDocumentEntity; } });
const customer_entity_1 = require("./infrastructure/persistence/relational/entities/customer.entity");
Object.defineProperty(exports, "CustomerEntity", { enumerable: true, get: function () { return customer_entity_1.CustomerEntity; } });
const staff_entity_1 = require("./infrastructure/persistence/relational/entities/staff.entity");
Object.defineProperty(exports, "StaffEntity", { enumerable: true, get: function () { return staff_entity_1.StaffEntity; } });
/** Entity metadata owned by this module; register with the host TypeORM DataSource. */
exports.CUSTOMER_ENTITIES = [
    customer_entity_1.CustomerEntity,
    branch_entity_1.BranchEntity,
    staff_entity_1.StaffEntity,
    customer_document_entity_1.CustomerDocumentEntity,
];
/** Standard package contract consumed by the host's generated registry. */
exports.moduleEntities = exports.CUSTOMER_ENTITIES;
