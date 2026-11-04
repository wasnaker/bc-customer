import { DeepPartial } from "../../../utils/types/deep-partial.type";
import { NullableType } from "../../../utils/types/nullable.type";
import { IPaginationOptions } from "../../../utils/types/pagination-options";
import { Staff } from "../../domain/staff";

import { FilterStaffDto, SortStaffDto } from "../../dto/query-staff.dto";

export abstract class StaffRepository {
  abstract create(
    data: Omit<Staff, "id" | "createdAt" | "updatedAt" | "ulid">,
  ): Promise<Staff>;

  abstract findManyByBranchId({
    branchId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    branchId: Staff["branchId"];
    filterOptions?: FilterStaffDto | null;
    sortOptions?: SortStaffDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Staff[]>;

  /**
   * List global (lintas branch) untuk tabel Staff mandiri — branchId
   * opsional sebagai filter. Hasil membawa `branchName` dan `customerName`.
   */
  abstract findMany({
    branchId,
    customerId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    branchId?: Staff["branchId"] | null;
    /** Filter via branch.customerId — mode "customer dipilih, cabang belum". */
    customerId?: Staff["branchId"] | null;
    filterOptions?: FilterStaffDto | null;
    sortOptions?: SortStaffDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Staff[]>;

  abstract countMany(
    branchId?: Staff["branchId"] | null,
    filterOptions?: FilterStaffDto | null,
    customerId?: Staff["branchId"] | null,
  ): Promise<number>;

  abstract findById(id: Staff["id"]): Promise<NullableType<Staff>>;

  abstract findByUserId(userId: number): Promise<NullableType<Staff>>;

  abstract countByBranchId(
    branchId: Staff["branchId"],
    filterOptions?: FilterStaffDto | null,
  ): Promise<number>;

  abstract update(
    id: Staff["id"],
    payload: DeepPartial<Staff>,
  ): Promise<Staff | null>;

  abstract remove(id: Staff["id"]): Promise<void>;
}
