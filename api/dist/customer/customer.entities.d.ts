import { ProvinceEntity } from './infrastructure/persistence/relational/entities/province.entity';
import { RegencyEntity } from './infrastructure/persistence/relational/entities/regency.entity';
/** Entity metadata owned by this module; register with the host TypeORM DataSource. */
export declare const CUSTOMER_ENTITIES: readonly [typeof ProvinceEntity, typeof RegencyEntity];
/** Standard package contract consumed by the host's generated registry. */
export declare const moduleEntities: readonly [typeof ProvinceEntity, typeof RegencyEntity];
export { ProvinceEntity, RegencyEntity };
