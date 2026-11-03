import { CreateProvinceDto } from '../dto/create-province.dto';
import { UpdateProvinceDto } from '../dto/update-province.dto';
import { FilterProvinceDto, SortProvinceDto } from '../dto/query-province.dto';
import { CreateRegencyDto } from '../dto/create-regency.dto';
import { UpdateRegencyDto } from '../dto/update-regency.dto';
import { FilterRegencyDto, SortRegencyDto } from '../dto/query-regency.dto';
import { Province } from '../domain/province';
import { Regency } from '../domain/regency';
import { ProvinceRepository } from '../infrastructure/persistence/province.repository';
import { RegencyRepository } from '../infrastructure/persistence/regency.repository';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
export declare class CustomerService {
    private readonly provinceRepository;
    private readonly regencyRepository;
    constructor(provinceRepository: ProvinceRepository, regencyRepository: RegencyRepository);
    createProvince(createProvinceDto: CreateProvinceDto): Promise<Province>;
    findManyProvincesWithPagination({ filterOptions, sortOptions, paginationOptions, }: {
        filterOptions?: FilterProvinceDto | null;
        sortOptions?: SortProvinceDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Province[]>;
    findProvinceById(id: Province['id']): Promise<NullableType<Province>>;
    findProvinceByIsoCode(isoCode: Province['isoCode']): Promise<NullableType<Province>>;
    updateProvince(id: Province['id'], updateProvinceDto: UpdateProvinceDto): Promise<Province>;
    removeProvince(id: Province['id']): Promise<void>;
    countAllProvinces(): Promise<number>;
    countProvinces(filterOptions?: FilterProvinceDto | null): Promise<number>;
    createRegency(createRegencyDto: CreateRegencyDto): Promise<Regency>;
    findManyRegenciesWithPagination({ filterOptions, sortOptions, paginationOptions, }: {
        filterOptions?: FilterRegencyDto | null;
        sortOptions?: SortRegencyDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Regency[]>;
    findRegenciesByProvinceId(provinceId: Regency['provinceId']): Promise<Regency[]>;
    findRegencyById(id: Regency['id']): Promise<NullableType<Regency>>;
    updateRegency(id: Regency['id'], updateRegencyDto: UpdateRegencyDto): Promise<Regency>;
    removeRegency(id: Regency['id']): Promise<void>;
    countAllRegencies(): Promise<number>;
    countRegencies(filterOptions?: FilterRegencyDto | null): Promise<number>;
    countRegenciesByProvinceId(provinceId: Regency['provinceId']): Promise<number>;
}
