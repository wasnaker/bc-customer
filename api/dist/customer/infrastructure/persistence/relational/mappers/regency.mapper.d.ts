import { Regency } from '../../../../domain/regency';
import { RegencyEntity } from '../entities/regency.entity';
export declare class RegencyMapper {
    static toDomain(raw: RegencyEntity): Regency;
    static toPersistence(domainEntity: Partial<Regency>): RegencyEntity;
}
