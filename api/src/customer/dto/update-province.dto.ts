import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CreateProvinceDto } from './create-province.dto';

export class UpdateProvinceDto extends PartialType(CreateProvinceDto) {
  @ApiPropertyOptional({ example: 'Jawa Barat', maxLength: 190 })
  @IsOptional()
  @IsString()
  @MaxLength(190)
  name?: string;

  @ApiPropertyOptional({ example: 'JB', maxLength: 10, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  isoCode?: string | null;

  @ApiPropertyOptional({ example: -6.9, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-90)
  @Max(90)
  latitude?: number | null;

  @ApiPropertyOptional({ example: 107.6, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-180)
  @Max(180)
  longitude?: number | null;
}
