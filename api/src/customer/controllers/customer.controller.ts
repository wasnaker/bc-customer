import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateProvinceDto } from '../dto/create-province.dto';
import { UpdateProvinceDto } from '../dto/update-province.dto';
import { QueryProvinceDto } from '../dto/query-province.dto';
import { CreateRegencyDto } from '../dto/create-regency.dto';
import { UpdateRegencyDto } from '../dto/update-regency.dto';
import { QueryRegencyDto, FilterRegencyDto } from '../dto/query-regency.dto';
import { Province } from '../domain/province';
import { Regency } from '../domain/regency';
import { CustomerService } from '../services/customer.service';
import { NullableType } from '../../utils/types/nullable.type';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CustomerAccessGuard } from '../security/customer-access.guard';
import { InfinityPaginationResponseDto, InfinityPaginationResponse } from '../../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../../utils/infinity-pagination';

// The host supplies JWT authentication and resolves module-declared action
// permissions through CustomerAccessGuard; no host-specific role IDs are assumed.

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Customer')
@Controller({ path: 'customer', version: '1' })
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // ─── Provinces ─────────────────────────────────────────────────────────────

  @ApiCreatedResponse({ type: Province })
  @UseGuards(CustomerAccessGuard)
  @Post('provinces')
  @HttpCode(HttpStatus.CREATED)
  createProvince(
    @Body() createProvinceDto: CreateProvinceDto,
  ): Promise<Province> {
    return this.customerService.createProvince(createProvinceDto);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Province) })
  @Get('provinces')
  @HttpCode(HttpStatus.OK)
  async findAllProvinces(
    @Query() query: QueryProvinceDto,
  ): Promise<InfinityPaginationResponseDto<Province>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const data = await this.customerService.findManyProvincesWithPagination({
      filterOptions: query.filters ?? null,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
    });

    const total = await this.customerService.countProvinces(
      query.filters ?? null,
    );

    return infinityPagination(data, { page, limit }, total);
  }

  @ApiOkResponse({ type: Province })
  @Get('provinces/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  findOneProvince(
    @Param('id', ParseIntPipe) id: Province['id'],
  ): Promise<NullableType<Province>> {
    return this.customerService.findProvinceById(id);
  }

  @ApiOkResponse({ type: Province })
  @UseGuards(CustomerAccessGuard)
  @Patch('provinces/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  updateProvince(
    @Param('id', ParseIntPipe) id: Province['id'],
    @Body() updateProvinceDto: UpdateProvinceDto,
  ): Promise<Province> {
    return this.customerService.updateProvince(id, updateProvinceDto);
  }

  @UseGuards(CustomerAccessGuard)
  @Delete('provinces/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String, required: true })
  removeProvince(
    @Param('id', ParseIntPipe) id: Province['id'],
  ): Promise<void> {
    return this.customerService.removeProvince(id);
  }

  // ─── Regencies ─────────────────────────────────────────────────────────────

  @ApiCreatedResponse({ type: Regency })
  @UseGuards(CustomerAccessGuard)
  @Post('regencies')
  @HttpCode(HttpStatus.CREATED)
  createRegency(
    @Body() createRegencyDto: CreateRegencyDto,
  ): Promise<Regency> {
    return this.customerService.createRegency(createRegencyDto);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Regency) })
  @Get('regencies')
  @HttpCode(HttpStatus.OK)
  async findAllRegencies(
    @Query() query: QueryRegencyDto,
  ): Promise<InfinityPaginationResponseDto<Regency>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const filterOptions: FilterRegencyDto | null = query.filters ?? {};
    if (filterOptions) {
      if (query.provinceId !== undefined) {
        filterOptions.provinceId = query.provinceId;
      }
    }

    const data = await this.customerService.findManyRegenciesWithPagination({
      filterOptions,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
    });

    const total = await this.customerService.countRegencies(filterOptions);

    return infinityPagination(data, { page, limit }, total);
  }

  @ApiOkResponse({ type: Regency })
  @Get('regencies/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  findOneRegency(
    @Param('id', ParseIntPipe) id: Regency['id'],
  ): Promise<NullableType<Regency>> {
    return this.customerService.findRegencyById(id);
  }

  @ApiOkResponse({ type: Regency })
  @UseGuards(CustomerAccessGuard)
  @Patch('regencies/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  updateRegency(
    @Param('id', ParseIntPipe) id: Regency['id'],
    @Body() updateRegencyDto: UpdateRegencyDto,
  ): Promise<Regency> {
    return this.customerService.updateRegency(id, updateRegencyDto);
  }

  @UseGuards(CustomerAccessGuard)
  @Delete('regencies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String, required: true })
  removeRegency(
    @Param('id', ParseIntPipe) id: Regency['id'],
  ): Promise<void> {
    return this.customerService.removeRegency(id);
  }
}
