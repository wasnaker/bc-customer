import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Branch } from "../domain/branch";

export class FilterBranchDto {
  @ApiPropertyOptional({ example: "Kantor Pusat" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isHeadOffice?: boolean;
}

export class SortBranchDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Branch;

  @ApiProperty({ enum: ["ASC", "DESC"] })
  @Transform(({ value }) => String(value).toUpperCase())
  @IsIn(["ASC", "DESC"])
  order: string;
}

export class QueryBranchDto {
  @ApiPropertyOptional()
  @Transform(({ value }) =>
    value === undefined || value === "" ? 1 : Number(value),
  )
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) =>
    value === undefined || value === "" ? 10 : Number(value),
  )
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;

  /**
   * Filter opsional milik customer (global list `GET /customer/branches`).
   * Diabaikan pada route nested `GET /customer/:customerId/branches`.
   */
  @ApiPropertyOptional({ example: "11", description: "Bigint PK as string" })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  })
  @Type(() => FilterBranchDto)
  filters?: FilterBranchDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  })
  @Type(() => SortBranchDto)
  sort?: SortBranchDto[] | null;
}
