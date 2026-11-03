import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { CreateRegencyDto } from './create-regency.dto';
import { Regency, RegencyTypeEnum } from '../domain/regency';

export class UpdateRegencyDto extends PartialType(CreateRegencyDto) {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsOptional()
  provinceId?: Regency['provinceId'];

  @ApiPropertyOptional({ example: 'Bandung', maxLength: 190 })
  @IsOptional()
  @IsString()
  @MaxLength(190)
  name?: string;

  @ApiPropertyOptional({ example: 'kota', enum: RegencyTypeEnum })
  @IsOptional()
  @IsEnum(RegencyTypeEnum)
  type?: RegencyTypeEnum;

  @ApiPropertyOptional({ example: '32.73', description: 'Kode BPS 4 digit' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.\d{2}$/, { message: 'code harus format BPS 4 digit, mis. 32.73' })
  code?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}