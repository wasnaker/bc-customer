import {
  Body,
  Controller,
  Inject,
  Optional,
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
import { CustomerScopeGuard } from "../security/customer-scope.guard";
import { CustomerScope } from "../security/customer-scope.decorator";
import {
  CUSTOMER_MODULE_OPTIONS,
  CustomerModuleOptions,
} from "../customer.options";
import {
  CustomerResource,
  CustomerSelfBranch,
} from "../security/customer-resource.decorator";
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
@UseGuards(AuthGuard("jwt"), CustomerAccessGuard, CustomerScopeGuard)
@ApiTags("Customer")
@Controller({ path: "customer", version: "1" })
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly branchService: BranchService,
    private readonly staffService: StaffService,
    private readonly customerDocumentService: CustomerDocumentService,
    @Optional()
    @Inject(CUSTOMER_MODULE_OPTIONS)
    private readonly moduleOptions?: CustomerModuleOptions,
  ) {}

  // ─── Documents (polymorphic: customer / branch / staff) ───────────────────
  // Declared before the `:id` customer routes so 'documents' is not captured
  // as an id param by NestJS route matching.

  @ApiCreatedResponse({ type: CustomerDocument })
  @CustomerScope({ kind: 'document-owner-body' })
  @Post("documents")
  @HttpCode(HttpStatus.CREATED)
  createDocument(
    @Body() createCustomerDocumentDto: CreateCustomerDocumentDto,
  ): Promise<CustomerDocument> {
    return this.customerDocumentService.create(createCustomerDocumentDto);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(CustomerDocument) })
  @CustomerScope({ kind: 'document-owner-query' })
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
  @CustomerScope({ kind: 'document-lookup', param: 'id' })
  @Patch("documents/:id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  updateDocument(
    @Param("id") id: string,
    @Body() updateCustomerDocumentDto: UpdateCustomerDocumentDto,
  ): Promise<CustomerDocument> {
    return this.customerDocumentService.update(id, updateCustomerDocumentDto);
  }

  @CustomerScope({ kind: 'document-lookup', param: 'id' })
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
  @CustomerScope({ kind: 'branch-list' })
  @CustomerResource("branch")
  @Get("branches")
  @HttpCode(HttpStatus.OK)
  async findAllBranches(
    @Req() request: {
      customerAuthorizationScope?: {
        global: boolean;
        customerIds: string[];
        branchIds: string[];
      };
    },
    @Query() query: QueryBranchDto,
  ): Promise<InfinityPaginationResponseDto<Branch>> {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 50);

    const filterOptions: FilterBranchDto | null = query.filters ?? null;
    const customerId = query.customerId?.trim() || null;
    const scope = request.customerAuthorizationScope ?? {
      global: false,
      customerIds: [],
      branchIds: [],
    };

    const data = await this.branchService.findMany({
      customerId,
      filterOptions,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
      scope,
    });
    const total = await this.branchService.countMany(customerId, filterOptions, scope);

    return infinityPagination(data, { page, limit }, total);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Staff) })
  @CustomerScope({ kind: 'staff-list' })
  @CustomerResource("staff")
  @Get("staff")
  @HttpCode(HttpStatus.OK)
  async findAllStaff(
    @Req() request: {
      customerAuthorizationScope?: {
        global: boolean;
        customerIds: string[];
        branchIds: string[];
      };
    },
    @Query() query: QueryStaffDto,
  ): Promise<InfinityPaginationResponseDto<Staff>> {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 50);

    const filterOptions: FilterStaffDto | null = query.filters ?? null;
    const branchId = query.branchId?.trim() || null;
    const customerId = query.customerId?.trim() || null;
    const scope = request.customerAuthorizationScope ?? {
      global: false,
      customerIds: [],
      branchIds: [],
    };

    const data = await this.staffService.findMany({
      branchId,
      customerId,
      filterOptions,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
      scope,
    });
    const total = await this.staffService.countMany(
      branchId,
      filterOptions,
      customerId,
      scope,
    );

    return infinityPagination(data, { page, limit }, total);
  }

  /**
   * Returns the signed-in user's own resolved permissions/scopes for UI
   * affordances. API guards still re-evaluate every operation independently.
   */
  @CustomerSelfBranch()
  @Get("me/scope")
  @HttpCode(HttpStatus.OK)
  async findMyScope(
    @Req() request: { user?: { id?: number | string } },
  ): Promise<{
    global: boolean;
    permissions: Record<
      string,
      { global: boolean; customerIds: string[]; branchIds: string[] }
    >;
  }> {
    const userId = request.user?.id;
    if (userId === undefined || userId === null) {
      throw new UnauthorizedException();
    }
    const resolveScopes = this.moduleOptions?.resolveScopes;
    if (!resolveScopes) {
      throw new NotFoundException();
    }

    const permissionNames = [
      "read:customer",
      "create:customer",
      "read:branch",
      "read:staff",
      "create:branch",
      "update:branch",
      "delete:branch",
      "create:staff",
      "update:staff",
      "delete:staff",
      "read:my-customer-branch",
      "read:my-customer-staff",
      "update:my-customer-staff",
      "update:customer",
      "delete:customer",
    ];
    const resolved = await Promise.all(
      permissionNames.map(async (permission) => [
        permission,
        await resolveScopes(userId, permission),
      ] as const),
    );
    const permissions = Object.fromEntries(
      resolved.map(([permission, scope]) => [
        permission,
        {
          global: scope.global,
          customerIds: scope.scopes
            .filter((item) => item.type === "customer")
            .map((item) => String(item.id)),
          branchIds: scope.scopes
            .filter((item) => item.type === "branch")
            .map((item) => String(item.id)),
        },
      ]),
    );
    return {
      global: resolved.some(([, scope]) => scope.global),
      permissions,
    };
  }

  /**
   * Profile staff list. Scope is resolved from the dedicated Profile permission,
   * so Customer Admin receives company scope and Branch Admin receives only
   * the assigned branch scope. Client-supplied customer/branch IDs are ignored.
   */
  @ApiOkResponse({ type: InfinityPaginationResponse(Staff) })
  @CustomerResource("my-customer-staff")
  @CustomerScope({ kind: 'staff-list', permissionResource: 'my-customer-staff' })
  @Get("me/staff")
  @HttpCode(HttpStatus.OK)
  async findMyStaff(
    @Req() request: { customerAuthorizationScope?: { global: boolean; customerIds: string[]; branchIds: string[] } },
    @Query() query: QueryStaffDto,
  ): Promise<InfinityPaginationResponseDto<Staff>> {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 50);
    const scope = request.customerAuthorizationScope ?? { global: false, customerIds: [], branchIds: [] };
    const data = await this.staffService.findMany({
      filterOptions: query.filters ?? null,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
      scope,
    });
    const total = await this.staffService.countMany(null, query.filters ?? null, null, scope);
    return infinityPagination(data, { page, limit }, total);
  }

  /** Profile-only update endpoint; CustomerScopeGuard enforces the same role's scope. */
  @ApiOkResponse({ type: Staff })
  @CustomerResource("my-customer-staff")
  @CustomerScope({ kind: 'staff-lookup', param: 'id', permissionResource: 'my-customer-staff' })
  @Patch("me/staff/:id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  updateMyStaff(
    @Param("id") id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<Staff> {
    return this.staffService.update(id, updateStaffDto);
  }

  /**
   * Self-service branch lookup. The branch is derived only from the
   * authenticated user's linked staff record; no user/branch ID is accepted
   * from the client, so this endpoint cannot be used to enumerate other
   * customers or branches.
   */
  @ApiOkResponse({ type: Branch })
  @CustomerSelfBranch("read:my-customer-company")
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
    if (!customer?.isActive) throw new NotFoundException();

    return {
      ...branch,
      customerName: customer?.name ?? null,
      staffName: staff.name,
      staffPosition: staff.position,
    };
  }

  // ─── Customers ─────────────────────────────────────────────────────────────

  @ApiCreatedResponse({ type: Customer })
  @CustomerScope({ kind: 'global-create' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.create(createCustomerDto);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Customer) })
  @CustomerScope({ kind: 'customer-list' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findCustomers(
    @Req() request: {
      customerAuthorizationScope?: {
        global: boolean;
        customerIds: string[];
        branchIds: string[];
      };
    },
    @Query() query: QueryCustomerDto,
  ): Promise<InfinityPaginationResponseDto<Customer>> {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 50);
    const currentScope = request.customerAuthorizationScope ?? {
      global: false,
      customerIds: [],
      branchIds: [],
    };
    const scope = {
      global: currentScope.global,
      customerIds: currentScope.customerIds,
    };

    const data = await this.customerService.findManyWithPagination({
      filterOptions: query.filters ?? null,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
      scope,
    });
    const total = await this.customerService.countWithFilter(
      query.filters ?? null,
      scope,
    );

    return infinityPagination(data, { page, limit }, total);
  }

  @ApiOkResponse({ type: Customer })
  @CustomerScope({ kind: 'customer-lookup', param: 'id' })
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
  @CustomerScope({ kind: 'customer-lookup', param: 'id' })
  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  updateCustomer(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @CustomerScope({ kind: 'customer-lookup', param: 'id' })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: "id", type: String, required: true })
  removeCustomer(@Param("id") id: string): Promise<void> {
    return this.customerService.remove(id);
  }

  // ─── Branches ──────────────────────────────────────────────────────────────

  @ApiCreatedResponse({ type: Branch })
  @CustomerResource("branch")
  @CustomerScope({ kind: 'customer-param', param: 'customerId' })
  @Post(":customerId/branches")
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: "customerId", type: String, required: true })
  createBranch(
    @Param("customerId") customerId: string,
    @Body() createBranchDto: CreateBranchDto,
    @Req() request: { user?: { id?: number | string } },
  ): Promise<Branch> {
    const actorUserId = Number(request.user?.id);
    if (!Number.isSafeInteger(actorUserId) || actorUserId <= 0) throw new UnauthorizedException();
    return this.branchService.create(customerId, createBranchDto, actorUserId);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Branch) })
  @CustomerResource("branch")
  @CustomerScope({ kind: 'customer-param', param: 'customerId' })
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
  @CustomerScope({ kind: 'branch-lookup', param: 'id' })
  @Get("branches/:id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  findBranchById(@Param("id") id: string): Promise<NullableType<Branch>> {
    return this.branchService.findBranchById(id);
  }

  @ApiOkResponse({ type: Branch })
  @CustomerResource("branch")
  @CustomerScope({ kind: 'branch-lookup', param: 'id' })
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
  @CustomerScope({ kind: 'branch-lookup', param: 'id' })
  @Delete("branches/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: "id", type: String, required: true })
  removeBranch(@Param("id") id: string): Promise<void> {
    return this.branchService.remove(id);
  }

  // ─── Staff ─────────────────────────────────────────────────────────────────

  @ApiCreatedResponse({ type: Staff })
  @CustomerResource("staff")
  @CustomerScope({ kind: 'branch-param', param: 'branchId' })
  @Post("branches/:branchId/staff")
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: "branchId", type: String, required: true })
  createStaff(
    @Param("branchId") branchId: string,
    @Body() createStaffDto: CreateStaffDto,
    @Req() request: { user?: { id?: number | string } },
  ): Promise<Staff> {
    const actorUserId = Number(request.user?.id);
    if (!Number.isSafeInteger(actorUserId) || actorUserId <= 0) throw new UnauthorizedException();
    return this.staffService.create(branchId, createStaffDto, actorUserId);
  }

  @ApiOkResponse({ type: InfinityPaginationResponse(Staff) })
  @CustomerResource("staff")
  @CustomerScope({ kind: 'branch-param', param: 'branchId' })
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
  @CustomerScope({ kind: 'staff-lookup', param: 'id' })
  @Get("staff/:id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: "id", type: String, required: true })
  findStaffById(@Param("id") id: string): Promise<NullableType<Staff>> {
    return this.staffService.findStaffById(id);
  }

  @ApiOkResponse({ type: Staff })
  @CustomerResource("staff")
  @CustomerScope({ kind: 'staff-lookup', param: 'id' })
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
  @CustomerScope({ kind: 'staff-lookup', param: 'id' })
  @Delete("staff/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: "id", type: String, required: true })
  removeStaff(@Param("id") id: string): Promise<void> {
    return this.staffService.remove(id);
  }
}
