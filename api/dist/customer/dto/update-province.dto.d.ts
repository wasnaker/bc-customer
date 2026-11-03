import { CreateProvinceDto } from './create-province.dto';
declare const UpdateProvinceDto_base: import("@nestjs/common").Type<Partial<CreateProvinceDto>>;
export declare class UpdateProvinceDto extends UpdateProvinceDto_base {
    name?: string;
    isoCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}
export {};
