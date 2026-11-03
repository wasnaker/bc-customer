import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  Max,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Regency, RegencyTypeEnum } from '../domain/regency';

export class FilterRegencyDto {
  @ApiPropertyOptional({ name: 'province_id', example: 1 })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const rawValue = value ?? obj?.province_id;
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return undefined;
    }
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : rawValue;
  })
  @IsInt()
  @Min(1)
  provinceId?: Regency['provinceId'];

  @ApiPropertyOptional({ enum: RegencyTypeEnum })
  @IsOptional()
  @IsEnum(RegencyTypeEnum)
  type?: RegencyTypeEnum;
}

export class SortRegencyDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Regency;

  @ApiProperty({ enum: ['ASC', 'DESC'] })
  @Transform(({ value }) => String(value).toUpperCase())
  @IsIn(['ASC', 'DESC'])
  order: string;
}

export class QueryRegencyDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Transform(({ value }) => (value === undefined || value === '' ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
  @Transform(({ value }) => (value === undefined || value === '' ? 10 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ name: 'province_id', example: 1 })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const rawValue = value ?? obj?.province_id;
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return undefined;
    }
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : rawValue;
  })
  @IsInt()
  @Min(1)
  provinceId?: Regency['provinceId'];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  })
  @Type(() => FilterRegencyDto)
  filters?: FilterRegencyDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  })
  @Type(() => SortRegencyDto)
  sort?: SortRegencyDto[] | null;
}
