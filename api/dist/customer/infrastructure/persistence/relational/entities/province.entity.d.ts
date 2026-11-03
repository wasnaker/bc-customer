import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
export declare class ProvinceEntity extends EntityRelationalHelper {
    id: number;
    name: string;
    isoCode: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: Date;
    updatedAt: Date;
}
