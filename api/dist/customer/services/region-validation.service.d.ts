import { DataSource } from 'typeorm';
/**
 * Region validation bridge.
 *
 * region is a HARD dependency of this module, but its entity classes are NOT
 * imported — the contract between modules is the well-known table names
 * `province` / `regency` (int PKs). Raw DataSource queries keep the modules
 * decoupled at the code level while the DB foreign keys guarantee integrity.
 */
export declare class RegionValidationService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    assertProvinceExists(provinceId: number): Promise<void>;
    assertCityInProvince(cityId: number, provinceId: number): Promise<void>;
    /** Validate a province/city pair: province exists, then city belongs to it. */
    assertRegionPair(provinceId: number, cityId: number): Promise<void>;
}
