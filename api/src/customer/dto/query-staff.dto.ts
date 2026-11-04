import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Staff } from "../domain/staff";

export class FilterStaffDto {
  @ApiPropertyOptional({ example: "Budi" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "Manager" })
  @IsOptional()
  @IsString()
  position?: string;
}

export class SortStaffDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Staff;

  @ApiProperty({ enum: ["ASC", "DESC"] })
  @Transform(({ value }) => String(value).toUpperCase())
  @IsIn(["ASC", "DESC"])
  order: string;
}

export class QueryStaffDto {
  /**
   * Filter opsional milik branch (global list `GET /customer/staff`).
   * Diabaikan pada route nested `GET /customer/branches/:branchId/staff`.
   */
  @ApiPropertyOptional({ example: "18", description: "Bigint PK as string" })
  @IsOptional()
  @IsString()
  branchId?: string;

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

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  })
  @Type(() => FilterStaffDto)
  filters?: FilterStaffDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  })
  @Type(() => SortStaffDto)
  sort?: SortStaffDto[] | null;
}
