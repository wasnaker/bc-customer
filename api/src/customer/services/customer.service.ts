import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
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

@Injectable()
export class CustomerService {
  constructor(
    private readonly provinceRepository: ProvinceRepository,
    private readonly regencyRepository: RegencyRepository,
  ) {}

  // ─── Provinces ────────────────────────────────────────────────────────────

  async createProvince(
    createProvinceDto: CreateProvinceDto,
  ): Promise<Province> {
    const existing = await this.provinceRepository.findByName(
      createProvinceDto.name,
    );
    if (existing) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          name: 'provinceNameAlreadyExists',
        },
      });
    }

    if (createProvinceDto.isoCode) {
      const existingIsoCode = await this.provinceRepository.findByIsoCode(
        createProvinceDto.isoCode,
      );
      if (existingIsoCode) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { isoCode: 'provinceIsoCodeAlreadyExists' },
        });
      }
    }

    return this.provinceRepository.create({
      name: createProvinceDto.name,
      isoCode: createProvinceDto.isoCode ?? null,
      latitude: createProvinceDto.latitude ?? null,
      longitude: createProvinceDto.longitude ?? null,
    });
  }

  async findManyProvincesWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProvinceDto | null;
    sortOptions?: SortProvinceDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Province[]> {
    return this.provinceRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findProvinceById(id: Province['id']): Promise<NullableType<Province>> {
    return this.provinceRepository.findById(id);
  }

  async findProvinceByIsoCode(
    isoCode: Province['isoCode'],
  ): Promise<NullableType<Province>> {
    return this.provinceRepository.findByIsoCode(isoCode);
  }

  async updateProvince(
    id: Province['id'],
    updateProvinceDto: UpdateProvinceDto,
  ): Promise<Province> {
    const province = await this.provinceRepository.findById(id);
    if (!province) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          province: 'provinceNotExists',
        },
      });
    }

    if (updateProvinceDto.name) {
      const existing = await this.provinceRepository.findByName(
        updateProvinceDto.name,
      );
      if (existing && existing.id !== id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            name: 'provinceNameAlreadyExists',
          },
        });
      }
    }

    if (updateProvinceDto.isoCode) {
      const existingIsoCode = await this.provinceRepository.findByIsoCode(
        updateProvinceDto.isoCode,
      );
      if (existingIsoCode && existingIsoCode.id !== id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { isoCode: 'provinceIsoCodeAlreadyExists' },
        });
      }
    }

    const updated = await this.provinceRepository.update(id, {
      ...updateProvinceDto,
    });
    if (!updated) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          province: 'provinceNotExists',
        },
      });
    }
    return updated;
  }

  async removeProvince(id: Province['id']): Promise<void> {
    const province = await this.provinceRepository.findById(id);
    if (!province) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          province: 'provinceNotExists',
        },
      });
    }

    // The PostgreSQL foreign key owns the cascade. Delete the parent once so
    // the database guarantees atomic referential integrity.
    await this.provinceRepository.remove(id);
  }

  async countAllProvinces(): Promise<number> {
    return this.provinceRepository.countAll();
  }

  async countProvinces(filterOptions?: FilterProvinceDto | null): Promise<number> {
    if (this.provinceRepository.countWithFilter) {
      return this.provinceRepository.countWithFilter(filterOptions);
    }
    return this.provinceRepository.countAll();
  }

  // ─── Regencies ─────────────────────────────────────────────────────────────

  async createRegency(createRegencyDto: CreateRegencyDto): Promise<Regency> {
    const province = await this.provinceRepository.findById(
      createRegencyDto.provinceId,
    );
    if (!province) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          province: 'provinceNotExists',
        },
      });
    }

    const existing = await this.regencyRepository.findByProvinceIdAndName(
      createRegencyDto.provinceId,
      createRegencyDto.name,
    );
    if (existing) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { name: 'regencyNameAlreadyExists' },
      });
    }

    return this.regencyRepository.create({
      provinceId: createRegencyDto.provinceId,
      name: createRegencyDto.name,
      type: createRegencyDto.type,
      isActive: createRegencyDto.isActive ?? true,
    });
  }

  async findManyRegenciesWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterRegencyDto | null;
    sortOptions?: SortRegencyDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Regency[]> {
    return this.regencyRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async findRegenciesByProvinceId(
    provinceId: Regency['provinceId'],
  ): Promise<Regency[]> {
    return this.regencyRepository.findByProvinceId(provinceId);
  }

  async findRegencyById(id: Regency['id']): Promise<NullableType<Regency>> {
    return this.regencyRepository.findById(id);
  }

  async updateRegency(
    id: Regency['id'],
    updateRegencyDto: UpdateRegencyDto,
  ): Promise<Regency> {
    const regency = await this.regencyRepository.findById(id);
    if (!regency) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          regency: 'regencyNotExists',
        },
      });
    }

    if (updateRegencyDto.provinceId !== undefined) {
      const province = await this.provinceRepository.findById(
        updateRegencyDto.provinceId,
      );
      if (!province) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            province: 'provinceNotExists',
          },
        });
      }
    }

    const targetProvinceId = updateRegencyDto.provinceId ?? regency.provinceId;
    const targetName = updateRegencyDto.name ?? regency.name;
    const existing = await this.regencyRepository.findByProvinceIdAndName(
      targetProvinceId,
      targetName,
    );
    if (existing && existing.id !== id) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { name: 'regencyNameAlreadyExists' },
      });
    }

    const updated = await this.regencyRepository.update(id, {
      ...updateRegencyDto,
    });
    if (!updated) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          regency: 'regencyNotExists',
        },
      });
    }
    return updated;
  }

  async removeRegency(id: Regency['id']): Promise<void> {
    const regency = await this.regencyRepository.findById(id);
    if (!regency) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          regency: 'regencyNotExists',
        },
      });
    }

    await this.regencyRepository.remove(id);
  }

  async countAllRegencies(): Promise<number> {
    return this.regencyRepository.countAll();
  }

  async countRegencies(
    filterOptions?: FilterRegencyDto | null,
  ): Promise<number> {
    if (this.regencyRepository.countWithFilter) {
      return this.regencyRepository.countWithFilter(filterOptions);
    }
    if (filterOptions?.provinceId !== undefined) {
      return this.regencyRepository.countByProvinceId(filterOptions.provinceId);
    }
    return this.regencyRepository.countAll();
  }

  async countRegenciesByProvinceId(
    provinceId: Regency['provinceId'],
  ): Promise<number> {
    return this.regencyRepository.countByProvinceId(provinceId);
  }
}