"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegencyEntity = exports.ProvinceEntity = exports.moduleEntities = exports.CUSTOMER_ENTITIES = void 0;
const province_entity_1 = require("./infrastructure/persistence/relational/entities/province.entity");
Object.defineProperty(exports, "ProvinceEntity", { enumerable: true, get: function () { return province_entity_1.ProvinceEntity; } });
const regency_entity_1 = require("./infrastructure/persistence/relational/entities/regency.entity");
Object.defineProperty(exports, "RegencyEntity", { enumerable: true, get: function () { return regency_entity_1.RegencyEntity; } });
/** Entity metadata owned by this module; register with the host TypeORM DataSource. */
exports.CUSTOMER_ENTITIES = [province_entity_1.ProvinceEntity, regency_entity_1.RegencyEntity];
/** Standard package contract consumed by the host's generated registry. */
exports.moduleEntities = exports.CUSTOMER_ENTITIES;
