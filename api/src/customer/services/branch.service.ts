import {
  HttpStatus,
  Injectable,
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

@Injectable()
export class BranchService {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly regionValidation: RegionValidationService,
  ) {}

  async create(
    customerId: Branch["customerId"],
    createBranchDto: CreateBranchDto,
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

    return this.branchRepository.create({
      customerId,
      name: createBranchDto.name,
      isHeadOffice: createBranchDto.isHeadOffice ?? false,
      addressLine: createBranchDto.addressLine,
      provinceId: createBranchDto.provinceId,
      cityId: createBranchDto.cityId,
      postalCode: createBranchDto.postalCode ?? null,
      vatNumber: createBranchDto.vatNumber ?? null,
      vatType: createBranchDto.vatType ?? "npwp",
      isActive: createBranchDto.isActive ?? true,
    });
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
