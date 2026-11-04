import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class Staff {
  @ApiProperty({ example: "1", description: "Bigint PK serialized as string" })
  id: bigint | string;

  @ApiProperty({ example: "01JD8X7Q3K4M2N5P6R8T9VWXYZ" })
  ulid: string | null;

  @ApiProperty({ example: "1", description: "Owning branch id" })
  branchId: bigint | string;

  /** Nama branch induk — terisi pada list global (join), opsional. */
  @ApiPropertyOptional({ example: "Cabang Bandung PT Baja Prima Konstruksi" })
  branchName?: string | null;

  /** Nama customer atas branch — terisi pada list global (join), opsional. */
  @ApiPropertyOptional({ example: "PT Baja Prima Konstruksi" })
  customerName?: string | null;

  @ApiProperty({ example: "Budi Santoso" })
  name: string;

  @ApiProperty({
    example: 5,
    nullable: true,
    description: "Host user id (unique across staff when set)",
  })
  userId: number | null;

  @ApiProperty({ example: "Manager", nullable: true })
  position: string | null;

  @ApiProperty({ example: "+6281234567890", nullable: true })
  phone: string | null;

  @ApiProperty({ example: "budi@example.com", nullable: true })
  email: string | null;

  @ApiProperty({ example: "19800001", nullable: true, description: "NIP" })
  nip: string | null;

  @ApiProperty({ example: "Jl. Melati No. 5", nullable: true })
  addressLine: string | null;

  @ApiProperty({
    example: 11,
    nullable: true,
    description: "Province id (int), untuk modul actor lain",
  })
  provinceId: number | null;

  @ApiProperty({
    example: 1101,
    nullable: true,
    description: "Regency id (int), untuk modul actor lain",
  })
  cityId: number | null;

  @ApiProperty({
    example: "0f0e8d7c-6b5a-4938-a271-0f9e8d7c6b5a",
    nullable: true,
    description: "Host file id (uuid)",
  })
  photoId: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
