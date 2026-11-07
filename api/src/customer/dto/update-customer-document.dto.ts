import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import {
  CUSTOMER_DOCUMENT_OWNER_TYPES,
  CustomerDocumentOwnerTypeEnum,
} from '../domain/customer-document';
import { CreateCustomerDocumentDto } from './create-customer-document.dto';

export class UpdateCustomerDocumentDto extends PartialType(
  CreateCustomerDocumentDto,
) {
  @ApiPropertyOptional({ enum: CUSTOMER_DOCUMENT_OWNER_TYPES })
  @IsOptional()
  @Transform(({ value }) => String(value))
  @IsIn(Object.values(CustomerDocumentOwnerTypeEnum))
  ownerType?: CustomerDocumentOwnerTypeEnum;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? value : String(value)))
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ example: 'npwp', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @ApiPropertyOptional({
    example: '01.234.567.8-901.000',
    maxLength: 50,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  number?: string | null;

  @ApiPropertyOptional({
    example: '0f0e8d7c-6b5a-4938-a271-0f9e8d7c6b5a',
  })
  @IsOptional()
  @IsUUID()
  fileId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;
}
