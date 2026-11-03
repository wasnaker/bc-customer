import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  CUSTOMER_DOCUMENT_OWNER_TYPES,
  CustomerDocumentOwnerTypeEnum,
} from '../domain/customer-document';

export class CreateCustomerDocumentDto {
  @ApiProperty({ enum: CUSTOMER_DOCUMENT_OWNER_TYPES })
  @Transform(({ value }) => String(value))
  @IsNotEmpty()
  @IsIn(Object.values(CustomerDocumentOwnerTypeEnum))
  ownerType: CustomerDocumentOwnerTypeEnum;

  @ApiProperty({ example: '1', description: 'Owner id (bigint as string)' })
  @Transform(({ value }) => (value === undefined || value === '' ? value : String(value)))
  @IsNotEmpty()
  @IsString()
  ownerId: string;

  @ApiProperty({ example: 'npwp', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  type: string;

  @ApiPropertyOptional({
    example: '01.234.567.8-901.000',
    maxLength: 50,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  number?: string | null;

  @ApiProperty({
    example: '0f0e8d7c-6b5a-4938-a271-0f9e8d7c6b5a',
    description: 'Host file id (uuid)',
  })
  @IsNotEmpty()
  @IsUUID()
  fileId: string;

  @ApiPropertyOptional({ example: '2026-01-15', nullable: true })
  @IsOptional()
  @Type(() => Date)
  issuedAt?: Date | string | null;

  @ApiPropertyOptional({ example: '2031-01-15', nullable: true })
  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date | string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;
}
