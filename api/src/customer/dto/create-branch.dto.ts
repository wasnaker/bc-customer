import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({
    example: 'Cabang Bandung PT Baja Prima Konstruksi',
    description:
      'Sertakan nama customer agar jelas cabang milik perusahaan mana.',
    maxLength: 190,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(190)
  name: string;

  @ApiPropertyOptional({
    example: false,
    description:
      'Set true to designate this branch as the head office (max 1 per customer)',
  })
  @IsOptional()
  @IsBoolean()
  isHeadOffice?: boolean;

  @ApiProperty({
    example: 'Jl. Asia Afrika No. 10, Bandung',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  addressLine: string;

  @ApiProperty({ example: 11, description: 'Province id (int)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  provinceId: number;

  @ApiProperty({ example: 1101, description: 'Regency id (int)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cityId: number;

  @ApiPropertyOptional({ example: '40111', maxLength: 10, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string | null;

  @ApiPropertyOptional({
    example: '123456789012345678901234',
    maxLength: 24,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  vatNumber?: string | null;

  @ApiPropertyOptional({
    example: 'npwp',
    enum: ['npwp', 'nitku'],
    default: 'npwp',
  })
  @IsOptional()
  @IsIn(['npwp', 'nitku'])
  vatType?: 'npwp' | 'nitku';

  @ApiProperty({ example: 'Branch Admin Name', maxLength: 190 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(190)
  adminName: string;

  @ApiProperty({ example: 'branch.admin@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(190)
  adminEmail: string;

  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  adminPassword: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;
}
