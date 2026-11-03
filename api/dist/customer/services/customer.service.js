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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const province_repository_1 = require("../infrastructure/persistence/province.repository");
const regency_repository_1 = require("../infrastructure/persistence/regency.repository");
let CustomerService = class CustomerService {
    constructor(provinceRepository, regencyRepository) {
        this.provinceRepository = provinceRepository;
        this.regencyRepository = regencyRepository;
    }
    // ─── Provinces ────────────────────────────────────────────────────────────
    async createProvince(createProvinceDto) {
        const existing = await this.provinceRepository.findByName(createProvinceDto.name);
        if (existing) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    name: 'provinceNameAlreadyExists',
                },
            });
        }
        if (createProvinceDto.isoCode) {
            const existingIsoCode = await this.provinceRepository.findByIsoCode(createProvinceDto.isoCode);
            if (existingIsoCode) {
                throw new common_1.UnprocessableEntityException({
                    status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
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
    async findManyProvincesWithPagination({ filterOptions, sortOptions, paginationOptions, }) {
        return this.provinceRepository.findManyWithPagination({
            filterOptions,
            sortOptions,
            paginationOptions,
        });
    }
    async findProvinceById(id) {
        return this.provinceRepository.findById(id);
    }
    async findProvinceByIsoCode(isoCode) {
        return this.provinceRepository.findByIsoCode(isoCode);
    }
    async updateProvince(id, updateProvinceDto) {
        const province = await this.provinceRepository.findById(id);
        if (!province) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    province: 'provinceNotExists',
                },
            });
        }
        if (updateProvinceDto.name) {
            const existing = await this.provinceRepository.findByName(updateProvinceDto.name);
            if (existing && existing.id !== id) {
                throw new common_1.UnprocessableEntityException({
                    status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        name: 'provinceNameAlreadyExists',
                    },
                });
            }
        }
        if (updateProvinceDto.isoCode) {
            const existingIsoCode = await this.provinceRepository.findByIsoCode(updateProvinceDto.isoCode);
            if (existingIsoCode && existingIsoCode.id !== id) {
                throw new common_1.UnprocessableEntityException({
                    status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: { isoCode: 'provinceIsoCodeAlreadyExists' },
                });
            }
        }
        const updated = await this.provinceRepository.update(id, {
            ...updateProvinceDto,
        });
        if (!updated) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    province: 'provinceNotExists',
                },
            });
        }
        return updated;
    }
    async removeProvince(id) {
        const province = await this.provinceRepository.findById(id);
        if (!province) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    province: 'provinceNotExists',
                },
            });
        }
        // The PostgreSQL foreign key owns the cascade. Delete the parent once so
        // the database guarantees atomic referential integrity.
        await this.provinceRepository.remove(id);
    }
    async countAllProvinces() {
        return this.provinceRepository.countAll();
    }
    async countProvinces(filterOptions) {
        if (this.provinceRepository.countWithFilter) {
            return this.provinceRepository.countWithFilter(filterOptions);
        }
        return this.provinceRepository.countAll();
    }
    // ─── Regencies ─────────────────────────────────────────────────────────────
    async createRegency(createRegencyDto) {
        const province = await this.provinceRepository.findById(createRegencyDto.provinceId);
        if (!province) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    province: 'provinceNotExists',
                },
            });
        }
        const existing = await this.regencyRepository.findByProvinceIdAndName(createRegencyDto.provinceId, createRegencyDto.name);
        if (existing) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
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
    async findManyRegenciesWithPagination({ filterOptions, sortOptions, paginationOptions, }) {
        return this.regencyRepository.findManyWithPagination({
            filterOptions,
            sortOptions,
            paginationOptions,
        });
    }
    async findRegenciesByProvinceId(provinceId) {
        return this.regencyRepository.findByProvinceId(provinceId);
    }
    async findRegencyById(id) {
        return this.regencyRepository.findById(id);
    }
    async updateRegency(id, updateRegencyDto) {
        const regency = await this.regencyRepository.findById(id);
        if (!regency) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    regency: 'regencyNotExists',
                },
            });
        }
        if (updateRegencyDto.provinceId !== undefined) {
            const province = await this.provinceRepository.findById(updateRegencyDto.provinceId);
            if (!province) {
                throw new common_1.UnprocessableEntityException({
                    status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        province: 'provinceNotExists',
                    },
                });
            }
        }
        const targetProvinceId = updateRegencyDto.provinceId ?? regency.provinceId;
        const targetName = updateRegencyDto.name ?? regency.name;
        const existing = await this.regencyRepository.findByProvinceIdAndName(targetProvinceId, targetName);
        if (existing && existing.id !== id) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: { name: 'regencyNameAlreadyExists' },
            });
        }
        const updated = await this.regencyRepository.update(id, {
            ...updateRegencyDto,
        });
        if (!updated) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    regency: 'regencyNotExists',
                },
            });
        }
        return updated;
    }
    async removeRegency(id) {
        const regency = await this.regencyRepository.findById(id);
        if (!regency) {
            throw new common_1.UnprocessableEntityException({
                status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    regency: 'regencyNotExists',
                },
            });
        }
        await this.regencyRepository.remove(id);
    }
    async countAllRegencies() {
        return this.regencyRepository.countAll();
    }
    async countRegencies(filterOptions) {
        if (this.regencyRepository.countWithFilter) {
            return this.regencyRepository.countWithFilter(filterOptions);
        }
        if (filterOptions?.provinceId !== undefined) {
            return this.regencyRepository.countByProvinceId(filterOptions.provinceId);
        }
        return this.regencyRepository.countAll();
    }
    async countRegenciesByProvinceId(provinceId) {
        return this.regencyRepository.countByProvinceId(provinceId);
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [province_repository_1.ProvinceRepository,
        regency_repository_1.RegencyRepository])
], CustomerService);
