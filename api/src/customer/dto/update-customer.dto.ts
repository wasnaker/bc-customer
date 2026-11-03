import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * Partial update of a customer. The head-office branch is NOT updated here —
 * it has its own endpoints (`PATCH /customer/branches/:id`).
 */
export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'PT Wasnaker Mandiri', maxLength: 190 })
  @IsOptional()
  @IsString()
  @MaxLength(190)
  name?: string;

  @ApiPropertyOptional({ example: 5, nullable: true })
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

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;
}
