import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Regency, RegencyTypeEnum } from '../domain/regency';

export class CreateRegencyDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNotEmpty()
  provinceId: Regency['provinceId'];

  @ApiProperty({ example: 'Bandung', maxLength: 190 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(190)
  name: string;

  @ApiProperty({ example: 'kota', enum: RegencyTypeEnum })
  @IsNotEmpty()
  @IsEnum(RegencyTypeEnum)
  type: RegencyTypeEnum;

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