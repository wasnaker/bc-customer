import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'Budi Santoso', maxLength: 190 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(190)
  name: string;

  @ApiPropertyOptional({
    example: 5,
    nullable: true,
    description: 'Host user id (unique across all staff when set)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number | null;

  @ApiPropertyOptional({ example: 'Manager', maxLength: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string | null;

  @ApiPropertyOptional({ example: '+6281234567890', maxLength: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @ApiPropertyOptional({
    example: 'budi@example.com',
    maxLength: 190,
    nullable: true,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(190)
  email?: string | null;

  @ApiPropertyOptional({ example: '19800001', maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nip?: string | null;

  @ApiPropertyOptional({
    example: 'Jl. Melati No. 5',
    maxLength: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine?: string | null;

  @ApiPropertyOptional({
    example: 11,
    nullable: true,
    description: 'Province id (int)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  provinceId?: number | null;

  @ApiPropertyOptional({
    example: 1101,
    nullable: true,
    description: 'Regency id (int)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cityId?: number | null;

  @ApiPropertyOptional({
    example: '0f0e8d7c-6b5a-4938-a271-0f9e8d7c6b5a',
    nullable: true,
    description: 'Host file id (uuid)',
  })
  @IsOptional()
  @IsUUID()
  photoId?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
