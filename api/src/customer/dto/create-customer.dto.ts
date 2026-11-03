import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/** Address block shared by customers (head office), branches and staff. */
export class HeadOfficeDto {
  @ApiProperty({ example: 'Kantor Pusat Jakarta', maxLength: 190 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(190)
  name: string;

  @ApiProperty({
    example: 'Jl. Jenderal Sudirman No. 1, Jakarta Selatan',
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

  @ApiPropertyOptional({ example: '12190', maxLength: 10, nullable: true })
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
  nitkuNumber?: string | null;

  @ApiPropertyOptional({
    example: 'npwp',
    enum: ['npwp', 'nitku'],
    default: 'npwp',
  })
  @IsOptional()
  @IsIn(['npwp', 'nitku'])
  vatType?: 'npwp' | 'nitku';
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'PT Wasnaker Mandiri', maxLength: 190 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(190)
  name: string;

  @ApiPropertyOptional({
    example: 5,
    nullable: true,
    description: 'Host user id (main account)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number | null;

  @ApiPropertyOptional({
    example: '01.234.567.8-901.000',
    maxLength: 20,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  npwpNumber?: string | null;

  @ApiPropertyOptional({
    example: '1234567890123456',
    maxLength: 20,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nibNumber?: string | null;

  /**
   * Creating a customer ALWAYS creates its head-office branch simultaneously
   * (contract J1) — this block is the HO branch payload.
   */
  @ApiProperty({ type: HeadOfficeDto })
  @Type(() => HeadOfficeDto)
  headOffice: HeadOfficeDto;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;
}
