import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CustomerDocumentOwnerTypeEnum {
  CUSTOMER = 'customer',
  BRANCH = 'branch',
  STAFF = 'staff',
}

export const CUSTOMER_DOCUMENT_OWNER_TYPES = [
  CustomerDocumentOwnerTypeEnum.CUSTOMER,
  CustomerDocumentOwnerTypeEnum.BRANCH,
  CustomerDocumentOwnerTypeEnum.STAFF,
];

export class CustomerDocument {
  @ApiProperty({ example: '1', description: 'Bigint PK serialized as string' })
  id: bigint | string;

  @ApiProperty({ example: '01JD8X7Q3K4M2N5P6R8T9VWXYZ' })
  ulid: string | null;

  @ApiProperty({ example: 'customer', enum: CustomerDocumentOwnerTypeEnum })
  ownerType: CustomerDocumentOwnerTypeEnum;

  @ApiProperty({ example: '1', description: 'Owner id (customer/branch/staff)' })
  ownerId: bigint | string;

  @ApiProperty({ example: 'npwp', description: 'nib / npwp / nitku / legalitas / …' })
  type: string;

  @ApiProperty({ example: '01.234.567.8-901.000', nullable: true })
  number: string | null;

  @ApiProperty({
    example: '0f0e8d7c-6b5a-4938-a271-0f9e8d7c6b5a',
    description: 'Host file id (uuid) — file sebagai bukti dokumen',
  })
  fileId: string;

  @ApiProperty({ example: '2026-01-15', nullable: true })
  issuedAt: Date | string | null;

  @ApiProperty({ example: '2031-01-15', nullable: true })
  expiresAt: Date | string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
