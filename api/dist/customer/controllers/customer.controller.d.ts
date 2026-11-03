import { CreateProvinceDto } from '../dto/create-province.dto';
import { UpdateProvinceDto } from '../dto/update-province.dto';
import { QueryProvinceDto } from '../dto/query-province.dto';
import { CreateRegencyDto } from '../dto/create-regency.dto';
import { UpdateRegencyDto } from '../dto/update-regency.dto';
import { QueryRegencyDto } from '../dto/query-regency.dto';
import { Province } from '../domain/province';
import { Regency } from '../domain/regency';
import { CustomerService } from '../services/customer.service';
import { NullableType } from '../../utils/types/nullable.type';
import { InfinityPaginationResponseDto } from '../../utils/dto/infinity-pagination-response.dto';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    createProvince(createProvinceDto: CreateProvinceDto): Promise<Province>;
    findAllProvinces(query: QueryProvinceDto): Promise<InfinityPaginationResponseDto<Province>>;
    findOneProvince(id: Province['id']): Promise<NullableType<Province>>;
    updateProvince(id: Province['id'], updateProvinceDto: UpdateProvinceDto): Promise<Province>;
    removeProvince(id: Province['id']): Promise<void>;
    createRegency(createRegencyDto: CreateRegencyDto): Promise<Regency>;
    findAllRegencies(query: QueryRegencyDto): Promise<InfinityPaginationResponseDto<Regency>>;
    findOneRegency(id: Regency['id']): Promise<NullableType<Regency>>;
    updateRegency(id: Regency['id'], updateRegencyDto: UpdateRegencyDto): Promise<Regency>;
    removeRegency(id: Regency['id']): Promise<void>;
}
