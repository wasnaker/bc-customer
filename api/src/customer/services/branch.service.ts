import {
  HttpStatus,
  Injectable,
  Inject,
  Optional,
  UnprocessableEntityException,
} from "@nestjs/common";
import { CreateBranchDto } from "../dto/create-branch.dto";
import { UpdateBranchDto } from "../dto/update-branch.dto";
import { FilterBranchDto, SortBranchDto } from "../dto/query-branch.dto";
import { Branch } from "../domain/branch";
import { CustomerRepository } from "../infrastructure/persistence/customer.repository";
import { BranchRepository } from "../infrastructure/persistence/branch.repository";
import { NullableType } from "../../utils/types/nullable.type";
import { IPaginationOptions } from "../../utils/types/pagination-options";
import { RegionValidationService } from "./region-validation.service";
import { StaffRepository } from "../infrastructure/persistence/staff.repository";
import { CUSTOMER_MODULE_OPTIONS, CustomerModuleOptions } from "../customer.options";

@Injectable()
export class BranchService {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly regionValidation: RegionValidationService,
    private readonly staffRepository: StaffRepository,
    @Optional() @Inject(CUSTOMER_MODULE_OPTIONS)
    private readonly moduleOptions?: CustomerModuleOptions,
  ) {}

  async create(
    customerId: Branch["customerId"],
    createBranchDto: CreateBranchDto,
    actorUserId: number,
  ): Promise<Branch> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          customer: "customerNotExists",
        },
      });
    }

    await this.regionValidation.assertRegionPair(
      createBranchDto.provinceId,
      createBranchDto.cityId,
    );

    if (createBranchDto.isHeadOffice) {
      await this.assertHeadOfficeAvailable(customerId);
    }

    if (!this.moduleOptions?.createLoginAccount || !this.moduleOptions.deleteLoginAccount) {
      throw new UnprocessableEntityException({ status: HttpStatus.UNPROCESSABLE_ENTITY, errors: { account: "accountProvisioningUnavailable" } });
    }
    const branch = await this.branchRepository.create({
      customerId, name: createBranchDto.name, isHeadOffice: createBranchDto.isHeadOffice ?? false,
      addressLine: createBranchDto.addressLine, provinceId: createBranchDto.provinceId,
      cityId: createBranchDto.cityId, postalCode: createBranchDto.postalCode ?? null,
      vatNumber: createBranchDto.vatNumber ?? null, vatType: createBranchDto.vatType ?? "npwp",
      isActive: createBranchDto.isActive ?? true,
    });
    let accountId: number | null = null;
    try {
      const account = await this.moduleOptions.createLoginAccount({
        email: createBranchDto.adminEmail, password: createBranchDto.adminPassword,
        name: createBranchDto.adminName, roleKey: "customer-branch-admin",
        scopeType: "branch", scopeId: String(branch.id), assignedBy: actorUserId,
      });
      accountId = account.id;
      await this.staffRepository.create({
        branchId: branch.id, name: createBranchDto.adminName, userId: account.id,
        position: "Branch Administrator", phone: null,
        email: createBranchDto.adminEmail.trim().toLowerCase(), nip: null,
        addressLine: null, provinceId: null, cityId: null, photoId: null, isActive: true,
      });
      return branch;
    } catch (error) {
      // Compensation must attempt both cleanup steps independently. A failure
      // while deleting the account must not leave the newly-created branch.
      const cleanupErrors: unknown[] = [];
      if (accountId !== null) {
        try {
          await this.moduleOptions.deleteLoginAccount(accountId);
        } catch (cleanupError) {
          cleanupErrors.push(cleanupError);
        }
      }
      try {
        await this.branchRepository.remove(branch.id);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
      if (cleanupErrors.length > 0) {
        throw new AggregateError(
          [error, ...cleanupErrors],
          "Branch creation failed and compensation was incomplete",
        );
      }
      throw error;
    }
  }

  async findManyByCustomerId({
    customerId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    customerId: Branch["customerId"];
    filterOptions?: FilterBranchDto | null;
    sortOptions?: SortBranchDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Branch[]> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          customer: "customerNotExists",
        },
      });
    }

    return this.branchRepository.findManyByCustomerId({
      customerId,
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  /**
   * List branch global (lintas customer) untuk tabel Branch mandiri.
   * `customerId` bersifat filter opsional — divalidasi bila diisi.
   */
  async findMany({
    customerId,
    filterOptions,
    sortOptions,
    paginationOptions,
    scope,
  }: {
    customerId?: Branch["customerId"] | null;
    scope?: { global: boolean; customerIds: readonly string[]; branchIds: readonly string[] };
    filterOptions?: FilterBranchDto | null;
    sortOptions?: SortBranchDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Branch[]> {
    if (customerId != null) {
      await this.assertCustomerExists(customerId);
    }
    return this.branchRepository.findMany({
      customerId,
      filterOptions,
      sortOptions,
      paginationOptions,
      scope,
    });
  }

  async countMany(
    customerId?: Branch["customerId"] | null,
    filterOptions?: FilterBranchDto | null,
    scope?: { global: boolean; customerIds: readonly string[]; branchIds: readonly string[] },
  ): Promise<number> {
    if (customerId != null) {
      await this.assertCustomerExists(customerId);
    }
    return this.branchRepository.countMany(customerId, filterOptions, scope);
  }

  private async assertCustomerExists(
    customerId: Branch["customerId"],
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

  async countByCustomerId(
    customerId: Branch["customerId"],
    filterOptions?: FilterBranchDto | null,
  ): Promise<number> {
    return this.branchRepository.countByCustomerId(customerId, filterOptions);
  }

  async findBranchById(id: Branch["id"]): Promise<NullableType<Branch>> {
    return this.branchRepository.findById(id);
  }

  async update(
    id: Branch["id"],
    updateBranchDto: UpdateBranchDto,
  ): Promise<Branch> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          branch: "branchNotExists",
        },
      });
    }

    if (
      updateBranchDto.provinceId !== undefined ||
      updateBranchDto.cityId !== undefined
    ) {
      const provinceId = updateBranchDto.provinceId ?? branch.provinceId;
      const cityId = updateBranchDto.cityId ?? branch.cityId;
      await this.regionValidation.assertRegionPair(provinceId, cityId);
    }

    if (updateBranchDto.isHeadOffice && !branch.isHeadOffice) {
      await this.assertHeadOfficeAvailable(branch.customerId);
    }

    const updated = await this.branchRepository.update(id, {
      ...updateBranchDto,
    });
    if (!updated) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          branch: "branchNotExists",
        },
      });
    }
    return updated;
  }

  async remove(id: Branch["id"]): Promise<void> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          branch: "branchNotExists",
        },
      });
    }

    try {
      // staff.branchId is FK RESTRICT — the DB owns referential integrity.
      await this.branchRepository.remove(id);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "23503"
      ) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            branch: "branchHasStaff",
          },
        });
      }
      throw error;
    }
  }

  /**
   * Friendly pre-check for the max-1-head-office rule. The partial unique
   * index `UQ_branch_headOffice` is the hard guarantee; this only surfaces a
   * readable error instead of a constraint violation.
   */
  private async assertHeadOfficeAvailable(
    customerId: Branch["customerId"],
  ): Promise<void> {
    const headOffice =
      await this.branchRepository.findHeadOfficeByCustomerId(customerId);
    if (headOffice) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          isHeadOffice: "customerAlreadyHasHeadOffice",
        },
      });
    }
  }
}
