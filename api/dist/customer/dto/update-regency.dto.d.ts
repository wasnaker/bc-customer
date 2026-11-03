import { CreateRegencyDto } from './create-regency.dto';
import { Regency, RegencyTypeEnum } from '../domain/regency';
declare const UpdateRegencyDto_base: import("@nestjs/common").Type<Partial<CreateRegencyDto>>;
export declare class UpdateRegencyDto extends UpdateRegencyDto_base {
    provinceId?: Regency['provinceId'];
    name?: string;
    type?: RegencyTypeEnum;
    code?: string | null;
    isActive?: boolean;
}
export {};
