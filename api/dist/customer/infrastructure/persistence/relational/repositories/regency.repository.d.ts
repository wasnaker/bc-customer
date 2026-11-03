import { Repository } from 'typeorm';
import { RegencyEntity } from '../entities/regency.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterRegencyDto, SortRegencyDto } from '../../../../dto/query-regency.dto';
import { Regency } from '../../../../domain/regency';
import { RegencyRepository } from '../../regency.repository';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
export declare class RegenciesRelationalRepository implements RegencyRepository {
    private readonly regencyRepository;
    constructor(regencyRepository: Repository<RegencyEntity>);
    create(data: Regency): Promise<Regency>;
    findManyWithPagination({ filterOptions, sortOptions, paginationOptions, }: {
        filterOptions?: FilterRegencyDto | null;
        sortOptions?: SortRegencyDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Regency[]>;
    findAll(): Promise<Regency[]>;
    findById(id: Regency['id']): Promise<NullableType<Regency>>;
    findByProvinceId(provinceId: Regency['provinceId']): Promise<Regency[]>;
    findByProvinceIdAndName(provinceId: Regency['provinceId'], name: Regency['name']): Promise<NullableType<Regency>>;
    countByProvinceId(provinceId: Regency['provinceId']): Promise<number>;
    countAll(): Promise<number>;
    countWithFilter(filterOptions?: FilterRegencyDto | null): Promise<number>;
    update(id: Regency['id'], payload: Partial<Regency>): Promise<Regency>;
    remove(id: Regency['id']): Promise<void>;
    removeByProvinceId(provinceId: Regency['provinceId']): Promise<void>;
    private buildWhere;
}
