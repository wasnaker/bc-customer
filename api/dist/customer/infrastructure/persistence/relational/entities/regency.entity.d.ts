import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { ProvinceEntity } from './province.entity';
export declare class RegencyEntity extends EntityRelationalHelper {
    id: number;
    provinceId: number;
    province?: ProvinceEntity;
    name: string;
    /** Kode BPS 4 digit, mis. 11.01 */
    code: string | null;
    type: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
