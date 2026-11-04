import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class Branch {
  @ApiProperty({ example: "1", description: "Bigint PK serialized as string" })
  id: bigint | string;

  @ApiProperty({ example: "01JD8X7Q3K4M2N5P6R8T9VWXYZ" })
  ulid: string | null;

  @ApiProperty({ example: "0000A1", description: "6-char Crockford Base32" })
  code: string | null;

  @ApiProperty({ example: "1", description: "Owning customer id" })
  customerId: bigint | string;

  /** Nama customer induk — terisi pada list global (join), opsional. */
  @ApiPropertyOptional({ example: "PT Sentosa Mitra Logistik" })
  customerName?: string | null;

  /**
   * Nama staff ter-link akun user (admin cabang) — terisi pada list global
   * (join staffs), opsional.
   */
  @ApiPropertyOptional({ example: "Ahmad Fauzi Lubis", nullable: true })
  adminName?: string | null;

  @ApiProperty({ example: "Kantor Pusat Jakarta" })
  name: string;

  @ApiProperty({ example: false })
  isHeadOffice: boolean;

  /**
   * Alamat lengkap — wajib untuk SEMUA branch (J2: bisa beda kota/provinsi).
   */
  @ApiProperty({ example: "Jl. Jenderal Sudirman No. 1, Jakarta Selatan" })
  addressLine: string;

  @ApiProperty({ example: 11, description: "Province id (int)" })
  provinceId: number;

  @ApiProperty({ example: 1101, description: "Regency id (int)" })
  cityId: number;

  @ApiProperty({ example: "12190", nullable: true })
  postalCode: string | null;

  @ApiProperty({ example: "123456789012345678901234", nullable: true })
  nitkuNumber: string | null;

  @ApiProperty({
    example: "npwp",
    enum: ["npwp", "nitku"],
    default: "npwp",
  })
  vatType: "npwp" | "nitku";

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
