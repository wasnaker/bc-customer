import { Repository } from 'typeorm';
import { ProvinceEntity } from '../entities/province.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterProvinceDto, SortProvinceDto } from '../../../../dto/query-province.dto';
import { Province } from '../../../../domain/province';
import { ProvinceRepository } from '../../province.repository';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
export declare class ProvincesRelationalRepository implements ProvinceRepository {
    private readonly provinceRepository;
    constructor(provinceRepository: Repository<ProvinceEntity>);
    create(data: Province): Promise<Province>;
    findManyWithPagination({ filterOptions, sortOptions, paginationOptions, }: {
        filterOptions?: FilterProvinceDto | null;
        sortOptions?: SortProvinceDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Province[]>;
    findAll(): Promise<Province[]>;
    findById(id: Province['id']): Promise<NullableType<Province>>;
    findByName(name: string): Promise<NullableType<Province>>;
    findByIsoCode(isoCode: Province['isoCode']): Promise<NullableType<Province>>;
    countAll(): Promise<number>;
    countWithFilter(filterOptions?: FilterProvinceDto | null): Promise<number>;
    update(id: Province['id'], payload: Partial<Province>): Promise<Province>;
    remove(id: Province['id']): Promise<void>;
}
