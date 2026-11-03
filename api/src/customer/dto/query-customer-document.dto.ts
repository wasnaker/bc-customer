import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  CUSTOMER_DOCUMENT_OWNER_TYPES,
  CustomerDocument,
  CustomerDocumentOwnerTypeEnum,
} from '../domain/customer-document';

export class QueryCustomerDocumentDto {
  /** Polymorphic owner discriminator — required for the list endpoint. */
  @ApiProperty({ enum: CUSTOMER_DOCUMENT_OWNER_TYPES })
  @Transform(({ value }) => String(value))
  @IsNotEmpty()
  @IsIn(Object.values(CustomerDocumentOwnerTypeEnum))
  ownerType: CustomerDocumentOwnerTypeEnum;

  /** Owner id (bigint serialized as string). */
  @ApiProperty({ example: '1' })
  @Transform(({ value }) => (value === undefined || value === '' ? value : String(value)))
  @IsNotEmpty()
  @IsString()
  ownerId: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? 10 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  })
  @Type(() => FilterCustomerDocumentDto)
  filters?: FilterCustomerDocumentDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  })
  sort?: SortCustomerDocumentDto[] | null;
}

export class FilterCustomerDocumentDto {
  @ApiPropertyOptional({ example: 'npwp' })
  @IsOptional()
  @IsString()
  type?: string;
}

export class SortCustomerDocumentDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof CustomerDocument;

  @ApiProperty({ enum: ['ASC', 'DESC'] })
  @Transform(({ value }) => String(value).toUpperCase())
  @IsIn(['ASC', 'DESC'])
  order: string;
}
