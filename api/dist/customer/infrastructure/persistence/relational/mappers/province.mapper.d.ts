import { Province } from '../../../../domain/province';
import { ProvinceEntity } from '../entities/province.entity';
export declare class ProvinceMapper {
    static toDomain(raw: ProvinceEntity): Province;
    static toPersistence(domainEntity: Partial<Province>): ProvinceEntity;
}
