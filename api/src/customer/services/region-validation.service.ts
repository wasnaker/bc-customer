import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Region validation bridge.
 *
 * region is a HARD dependency of this module, but its entity classes are NOT
 * imported — the contract between modules is the well-known table names
 * `province` / `regency` (int PKs). Raw DataSource queries keep the modules
 * decoupled at the code level while the DB foreign keys guarantee integrity.
 */
@Injectable()
export class RegionValidationService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async assertProvinceExists(provinceId: number): Promise<void> {
    const rows = await this.dataSource.query(
      'SELECT id FROM "province" WHERE id = $1 LIMIT 1',
      [provinceId],
    );
    if (!rows?.length) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          provinceId: 'provinceNotFound',
        },
      });
    }
  }

  async assertCityInProvince(
    cityId: number,
    provinceId: number,
  ): Promise<void> {
    const rows = await this.dataSource.query(
      'SELECT id FROM "regency" WHERE id = $1 AND "provinceId" = $2 LIMIT 1',
      [cityId, provinceId],
    );
    if (!rows?.length) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          cityId: 'cityNotInProvince',
        },
      });
    }
  }

  /** Validate a province/city pair: province exists, then city belongs to it. */
  async assertRegionPair(
    provinceId: number,
    cityId: number,
  ): Promise<void> {
    await this.assertProvinceExists(provinceId);
    await this.assertCityInProvince(cityId, provinceId);
  }
}
