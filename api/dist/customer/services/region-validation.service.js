"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionValidationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
/**
 * Region validation bridge.
 *
 * region is a HARD dependency of this module, but its entity classes are NOT
 * imported — the contract between modules is the well-known table names
 * `province` / `regency` (int PKs). Raw DataSource queries keep the modules
 * decoupled at the code level while the DB foreign keys guarantee integrity.
 */
let RegionValidationService = class RegionValidationService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async assertProvinceExists(provinceId) {
        const rows = await this.dataSource.query('SELECT id FROM "province" WHERE id = $1 LIMIT 1', [provinceId]);
        if (!rows?.length) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    provinceId: 'provinceNotFound',
                },
            });
        }
    }
    async assertCityInProvince(cityId, provinceId) {
        const rows = await this.dataSource.query('SELECT id FROM "regency" WHERE id = $1 AND "provinceId" = $2 LIMIT 1', [cityId, provinceId]);
        if (!rows?.length) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    cityId: 'cityNotInProvince',
                },
            });
        }
    }
    /** Validate a province/city pair: province exists, then city belongs to it. */
    async assertRegionPair(provinceId, cityId) {
        await this.assertProvinceExists(provinceId);
        await this.assertCityInProvince(cityId, provinceId);
    }
};
exports.RegionValidationService = RegionValidationService;
exports.RegionValidationService = RegionValidationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], RegionValidationService);
