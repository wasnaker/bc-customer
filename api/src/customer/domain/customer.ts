import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Customer {
  @ApiProperty({ example: '1', description: 'Bigint PK serialized as string' })
  id: bigint | string;

  @ApiProperty({ example: '01JD8X7Q3K4M2N5P6R8T9VWXYZ' })
  ulid: string | null;

  @ApiProperty({ example: '0000A1', description: '6-char Crockford Base32' })
  code: string | null;

  @ApiProperty({ example: 'PT Wasnaker Mandiri' })
  name: string;

  @ApiProperty({
    example: 1,
    nullable: true,
    description: 'Host user id (main account)',
  })
  userId: number | null;

  @ApiProperty({ example: '01.234.567.8-901.000', nullable: true })
  npwpNumber: string | null;

  @ApiProperty({ example: '1234567890123456', nullable: true })
  nibNumber: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
