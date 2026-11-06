import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { CreateCustomerDto } from "../dto/create-customer.dto";
import { UpdateCustomerDto } from "../dto/update-customer.dto";
import { QueryCustomerDto, FilterCustomerDto } from "../dto/query-customer.dto";
import { CreateBranchDto } from "../dto/create-branch.dto";
import { UpdateBranchDto } from "../dto/update-branch.dto";
import { QueryBranchDto, FilterBranchDto } from "../dto/query-branch.dto";
import { CreateStaffDto } from "../dto/create-staff.dto";
import { UpdateStaffDto } from "../dto/update-staff.dto";
import { QueryStaffDto, FilterStaffDto } from "../dto/query-staff.dto";
import { CreateCustomerDocumentDto } from "../dto/create-customer-document.dto";
import { UpdateCustomerDocumentDto } from "../dto/update-customer-document.dto";
import {
  QueryCustomerDocumentDto,
  FilterCustomerDocumentDto,
} from "../dto/query-customer-document.dto";
import { Customer } from "../domain/customer";
import { Branch } from "../domain/branch";
import { Staff } from "../domain/staff";
import { CustomerDocument } from "../domain/customer-document";
import { CustomerService } from "../services/customer.service";
import { BranchService } from "../services/branch.service";
import { StaffService } from "../services/staff.service";
import { CustomerDocumentService } from "../services/customer-document.service";
import { CustomerAccessGuard } from "../security/customer-access.guard";
import { CustomerResource, CustomerSelfBranch } from "../security/customer-resource.decorator";
import { NullableType } from "../../utils/types/nullable.type";
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from "../../utils/dto/infinity-pagination-response.dto";
import { infinityPagination } from "../../utils/infinity-pagination";

/**
 * The host supplies JWT authentication and resolves module-declared action
 * permissions through CustomerAccessGuard; permission = `${action}:${resource}`
 * where the resource comes from @CustomerResource metadata (default 'customer'
 * and document ownerType for polymorphic document routes).
 */
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), CustomerAccessGuard)
@ApiTags("Customer")
@Controller({ path: "customer", version: "1" })
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly branchService: BranchService,
    private readonly staffService: StaffService,
    private readonly customerDocumentService: CustomerDocumentService,
  ) {}

  // ─── Documents (polymorphic: customer / branch / staff) ───────────────────
  // Declared before the `:id` customer routes so 'documents' is not captured
  // as an id param by NestJS route matching.

  @ApiCreatedResponse({ type: CustomerDocument })
  @Post("documents")
  @HttpCode(HttpStatus.CREATED)
  createDocument(
    @Body() createCustomerDocumentDto: CreateCustomerDocumentDto,
  ): Promise<CustomerDocument> {
    return this.customerDocumentService.create(createCustomerDocumentDto);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(CustomerDocument) })
  @Get("documents")
  @HttpCode(HttpStatus.OK)
  async findDocuments(
    @Query() query: QueryCustomerDocumentDto,
  ): Promise<InfinityPaginationResponseDto<CustomerDocument>> {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 50);

    const filterOptions: FilterCustomerDocumentDto | null =
      query.filters ?? null;

    const data = await this.customerDocumentService.findManyByOwner({
      ownerType: query.ownerType,
      ownerId: query.ownerId,
      filterOptions,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
    });
    const total = await this.customerDocumentService.countByOwner(
      query.ownerType,
      query.ownerId,
      filterOptions,
    );

    return infinityPagination(data, { page, limit }, total);
  }

  @ApiOkResponse({ type: CustomerDocument })
  @Patch("documents/:id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  updateDocument(
    @Param("id") id: string,
    @Body() updateCustomerDocumentDto: UpdateCustomerDocumentDto,
  ): Promise<CustomerDocument> {
    return this.customerDocumentService.update(id, updateCustomerDocumentDto);
  }

  @Delete("documents/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: "id", type: String, required: true })
  removeDocument(@Param("id") id: string): Promise<void> {
    return this.customerDocumentService.remove(id);
  }

  // ─── Branches (global list) ────────────────────────────────────────────────
  // Declared before the `:id` customer routes so 'branches' is not captured
  // as an id param by NestJS route matching.

  @ApiOkResponse({ type: InfinityPaginationResponse(Branch) })
  @CustomerResource("branch")
  @Get("branches")
  @HttpCode(HttpStatus.OK)
  async findAllBranches(
    @Query() query: QueryBranchDto,
  ): Promise<InfinityPaginationResponseDto<Branch>> {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 50);

    const filterOptions: FilterBranchDto | null = query.filters ?? null;
    const customerId = query.customerId?.trim() || null;

    const data = await this.branchService.findMany({
      customerId,
      filterOptions,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
    });
    const total = await this.branchService.countMany(customerId, filterOptions);

    return infinityPagination(data, { page, limit }, total);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Staff) })
  @CustomerResource("staff")
  @Get("staff")
  @HttpCode(HttpStatus.OK)
  async findAllStaff(
    @Query() query: QueryStaffDto,
  ): Promise<InfinityPaginationResponseDto<Staff>> {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 50);

    const filterOptions: FilterStaffDto | null = query.filters ?? null;
    const branchId = query.branchId?.trim() || null;
    const customerId = query.customerId?.trim() || null;

    const data = await this.staffService.findMany({
      branchId,
      customerId,
      filterOptions,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
    });
    const total = await this.staffService.countMany(
      branchId,
      filterOptions,
      customerId,
    );

    return infinityPagination(data, { page, limit }, total);
  }

  /**
   * Self-service branch lookup. The branch is derived only from the
   * authenticated user's linked staff record; no user/branch ID is accepted
   * from the client, so this endpoint cannot be used to enumerate other
   * customers or branches.
   */
  @ApiOkResponse({ type: Branch })
  @CustomerSelfBranch()
  @Get("me/branch")
  @HttpCode(HttpStatus.OK)
  async findMyBranch(
    @Req() request: { user?: { id?: number | string } },
  ): Promise<Branch & { staffName: string; staffPosition: string | null }> {
    const userId = Number(request.user?.id);
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new UnauthorizedException();
    }

    const staff = await this.staffService.findStaffByUserId(userId);
    if (!staff || !staff.isActive) throw new NotFoundException();

    const branch = await this.branchService.findBranchById(staff.branchId);
    if (!branch || !branch.isActive) throw new NotFoundException();

    const customer = await this.customerService.findCustomerById(
      branch.customerId,
    );

    return {
      ...branch,
      customerName: customer?.name ?? null,
      staffName: staff.name,
      staffPosition: staff.position,
    };
  }

  // ─── Customers ─────────────────────────────────────────────────────────────

  @ApiCreatedResponse({ type: Customer })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.create(createCustomerDto);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Customer) })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findCustomers(
    @Query() query: QueryCustomerDto,
  ): Promise<InfinityPaginationResponseDto<Customer>> {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 50);

    const data = await this.customerService.findManyWithPagination({
      filterOptions: query.filters ?? null,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
    });
    const total = await this.customerService.countWithFilter(
      query.filters ?? null,
    );

    return infinityPagination(data, { page, limit }, total);
  }

  @ApiOkResponse({ type: Customer })
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  findCustomerById(@Param("id") id: string): Promise<NullableType<Customer>> {
    // Route ini menangkap SEMUA segmen tunggal (mis. /customer/branch).
    // Id non-numerik bukan customer — balas 404, bukan 500 BigInt.
    if (!/^\d+$/.test(id)) {
      throw new NotFoundException();
    }
    return this.customerService.findCustomerById(id);
  }

  @ApiOkResponse({ type: Customer })
  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  updateCustomer(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: "id", type: String, required: true })
  removeCustomer(@Param("id") id: string): Promise<void> {
    return this.customerService.remove(id);
  }

  // ─── Branches ──────────────────────────────────────────────────────────────

  @ApiCreatedResponse({ type: Branch })
  @CustomerResource("branch")
  @Post(":customerId/branches")
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: "customerId", type: String, required: true })
  createBranch(
    @Param("customerId") customerId: string,
    @Body() createBranchDto: CreateBranchDto,
  ): Promise<Branch> {
    return this.branchService.create(customerId, createBranchDto);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Branch) })
  @CustomerResource("branch")
  @Get(":customerId/branches")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "customerId", type: String, required: true })
  async findBranches(
    @Param("customerId") customerId: string,
    @Query() query: QueryBranchDto,
  ): Promise<InfinityPaginationResponseDto<Branch>> {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 50);

    const filterOptions: FilterBranchDto | null = query.filters ?? null;

    const data = await this.branchService.findManyByCustomerId({
      customerId,
      filterOptions,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
    });
    const total = await this.branchService.countByCustomerId(
      customerId,
      filterOptions,
    );

    return infinityPagination(data, { page, limit }, total);
  }

  @ApiOkResponse({ type: Branch })
  @CustomerResource("branch")
  @Get("branches/:id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  findBranchById(@Param("id") id: string): Promise<NullableType<Branch>> {
    return this.branchService.findBranchById(id);
  }

  @ApiOkResponse({ type: Branch })
  @CustomerResource("branch")
  @Patch("branches/:id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  updateBranch(
    @Param("id") id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ): Promise<Branch> {
    return this.branchService.update(id, updateBranchDto);
  }

  @CustomerResource("branch")
  @Delete("branches/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: "id", type: String, required: true })
  removeBranch(@Param("id") id: string): Promise<void> {
    return this.branchService.remove(id);
  }

  // ─── Staff ─────────────────────────────────────────────────────────────────

  @ApiCreatedResponse({ type: Staff })
  @CustomerResource("staff")
  @Post("branches/:branchId/staff")
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: "branchId", type: String, required: true })
  createStaff(
    @Param("branchId") branchId: string,
    @Body() createStaffDto: CreateStaffDto,
  ): Promise<Staff> {
    return this.staffService.create(branchId, createStaffDto);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Staff) })
  @CustomerResource("staff")
  @Get("branches/:branchId/staff")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "branchId", type: String, required: true })
  async findStaff(
    @Param("branchId") branchId: string,
    @Query() query: QueryStaffDto,
  ): Promise<InfinityPaginationResponseDto<Staff>> {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 50);

    const filterOptions: FilterStaffDto | null = query.filters ?? null;

    const data = await this.staffService.findManyByBranchId({
      branchId,
      filterOptions,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
    });
    const total = await this.staffService.countByBranchId(
      branchId,
      filterOptions,
    );

    return infinityPagination(data, { page, limit }, total);
  }

  @ApiOkResponse({ type: Staff })
  @CustomerResource("staff")
  @Get("staff/:id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  findStaffById(@Param("id") id: string): Promise<NullableType<Staff>> {
    return this.staffService.findStaffById(id);
  }

  @ApiOkResponse({ type: Staff })
  @CustomerResource("staff")
  @Patch("staff/:id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  updateStaff(
    @Param("id") id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<Staff> {
    return this.staffService.update(id, updateStaffDto);
  }

  @CustomerResource("staff")
  @Delete("staff/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: "id", type: String, required: true })
  removeStaff(@Param("id") id: string): Promise<void> {
    return this.staffService.remove(id);
  }
}
