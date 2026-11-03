import { Regency, RegencyTypeEnum } from '../domain/regency';
export declare class CreateRegencyDto {
    provinceId: Regency['provinceId'];
    name: string;
    type: RegencyTypeEnum;
    code?: string | null;
    isActive?: boolean;
}
