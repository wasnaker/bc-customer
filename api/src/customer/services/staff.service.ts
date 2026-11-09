import {
  HttpStatus,
  Injectable,
  Inject,
  Optional,
  UnprocessableEntityException,
} from "@nestjs/common";
import { CreateStaffDto } from "../dto/create-staff.dto";
import { UpdateStaffDto } from "../dto/update-staff.dto";
import { FilterStaffDto, SortStaffDto } from "../dto/query-staff.dto";
import { Staff } from "../domain/staff";
import { BranchRepository } from "../infrastructure/persistence/branch.repository";
import { CustomerRepository } from "../infrastructure/persistence/customer.repository";
import { StaffRepository } from "../infrastructure/persistence/staff.repository";
import { NullableType } from "../../utils/types/nullable.type";
import { IPaginationOptions } from "../../utils/types/pagination-options";
import { RegionValidationService } from "./region-validation.service";
import { CUSTOMER_MODULE_OPTIONS, CustomerModuleOptions } from "../customer.options";
import { CustomerCoreAccountProvisioningClient } from "../customer-core-account-provisioning.client";
import { CustomerCoreUserDirectoryClient } from "../customer-core-user-directory.client";

@Injectable()
export class StaffService {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly branchRepository: BranchRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly regionValidation: RegionValidationService,
    @Optional() @Inject(CUSTOMER_MODULE_OPTIONS)
    private readonly moduleOptions?: CustomerModuleOptions,
    @Optional() private readonly coreUsers?: CustomerCoreUserDirectoryClient,
    @Optional() private readonly accountProvisioning?: CustomerCoreAccountProvisioningClient,
  ) {}

  async create(
    branchId: Staff["branchId"],
    createStaffDto: CreateStaffDto,
    actorUserId: number,
  ): Promise<Staff> {
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          branch: "branchNotExists",
        },
      });
    }

    if (!this.accountProvisioning) {
      throw new UnprocessableEntityException({ status: HttpStatus.UNPROCESSABLE_ENTITY, errors: { account: "accountProvisioningUnavailable" } });
    }

    if (
      createStaffDto.provinceId !== undefined &&
      createStaffDto.provinceId !== null &&
      createStaffDto.cityId !== undefined &&
      createStaffDto.cityId !== null
    ) {
      await this.regionValidation.assertRegionPair(
        createStaffDto.provinceId,
        createStaffDto.cityId,
      );
    }

    const account = await this.accountProvisioning.create({
      email: createStaffDto.email, password: createStaffDto.password, name: createStaffDto.name,
      roleKey: "customer", scopeType: "branch", scopeId: String(branch.id), assignedBy: actorUserId,
    });
    try {
      return await this.staffRepository.create({
        branchId, name: createStaffDto.name, userId: account.id,
        position: createStaffDto.position ?? null, phone: createStaffDto.phone ?? null,
        email: createStaffDto.email.trim().toLowerCase(), nip: createStaffDto.nip ?? null,
        addressLine: createStaffDto.addressLine ?? null, provinceId: createStaffDto.provinceId ?? null,
        cityId: createStaffDto.cityId ?? null, photoId: createStaffDto.photoId ?? null,
        isActive: createStaffDto.isActive ?? true,
      });
    } catch (error) {
      await this.accountProvisioning.remove(account.id);
      throw error;
    }
  }

  async findManyByBranchId({
    branchId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    branchId: Staff["branchId"];
    filterOptions?: FilterStaffDto | null;
    sortOptions?: SortStaffDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Staff[]> {
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          branch: "branchNotExists",
        },
      });
    }

    return this.staffRepository.findManyByBranchId({
      branchId,
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async countByBranchId(
    branchId: Staff["branchId"],
    filterOptions?: FilterStaffDto | null,
  ): Promise<number> {
    return this.staffRepository.countByBranchId(branchId, filterOptions);
  }

  /**
   * List staff global (lintas branch) untuk tabel Staff mandiri.
   * `branchId` bersifat filter opsional — divalidasi bila diisi.
   */
  async findMany({
    branchId,
    customerId,
    filterOptions,
    sortOptions,
    paginationOptions,
    scope,
  }: {
    branchId?: Staff["branchId"] | null;
    customerId?: Staff["branchId"] | null;
    scope?: { global: boolean; customerIds: readonly string[]; branchIds: readonly string[] };
    filterOptions?: FilterStaffDto | null;
    sortOptions?: SortStaffDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Staff[]> {
    if (branchId != null) {
      await this.assertBranchExists(branchId);
    } else if (customerId != null) {
      await this.assertCustomerExists(customerId);
    }
    return this.staffRepository.findMany({
      branchId,
      customerId,
      filterOptions,
      sortOptions,
      paginationOptions,
      scope,
    });
  }

  async countMany(
    branchId?: Staff["branchId"] | null,
    filterOptions?: FilterStaffDto | null,
    customerId?: Staff["branchId"] | null,
    scope?: { global: boolean; customerIds: readonly string[]; branchIds: readonly string[] },
  ): Promise<number> {
    if (branchId != null) {
      await this.assertBranchExists(branchId);
    } else if (customerId != null) {
      await this.assertCustomerExists(customerId);
    }
    return this.staffRepository.countMany(branchId, filterOptions, customerId, scope);
  }

  private async assertCustomerExists(
    customerId: Staff["branchId"],
  ): Promise<void> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          customer: "customerNotExists",
        },
      });
    }
  }

  private async assertBranchExists(branchId: Staff["branchId"]): Promise<void> {
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          branch: "branchNotExists",
        },
      });
    }
  }

  async findStaffById(id: Staff["id"]): Promise<NullableType<Staff>> {
    return this.staffRepository.findById(id);
  }

  /** Resolve the signed-in host account to its single linked staff record. */
  async findStaffByUserId(userId: number): Promise<NullableType<Staff>> {
    if (this.coreUsers && !(await this.coreUsers.findById(userId))) return null;
    return this.staffRepository.findByUserId(userId);
  }

  async update(
    id: Staff["id"],
    updateStaffDto: UpdateStaffDto,
  ): Promise<Staff> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          staff: "staffNotExists",
        },
      });
    }

    if (updateStaffDto.email !== undefined && updateStaffDto.email !== staff.email) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { email: "staffLoginEmailImmutable" },
      });
    }

    if (
      updateStaffDto.provinceId !== undefined ||
      updateStaffDto.cityId !== undefined
    ) {
      const provinceId = updateStaffDto.provinceId ?? staff.provinceId;
      const cityId = updateStaffDto.cityId ?? staff.cityId;
      if (provinceId !== null && cityId !== null) {
        await this.regionValidation.assertRegionPair(provinceId, cityId);
      }
    }

    const updated = await this.staffRepository.update(id, {
      ...updateStaffDto,
    });
    if (!updated) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          staff: "staffNotExists",
        },
      });
    }
    return updated;
  }

  async remove(id: Staff["id"]): Promise<void> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          staff: "staffNotExists",
        },
      });
    }

    await this.staffRepository.remove(id);
  }

}
