import { DeepPartial } from "../../../utils/types/deep-partial.type";
import { NullableType } from "../../../utils/types/nullable.type";
import { IPaginationOptions } from "../../../utils/types/pagination-options";
import { Branch } from "../../domain/branch";

import { FilterBranchDto, SortBranchDto } from "../../dto/query-branch.dto";

export abstract class BranchRepository {
  abstract create(
    data: Omit<Branch, "id" | "createdAt" | "updatedAt" | "ulid" | "code">,
  ): Promise<Branch>;

  abstract findManyByCustomerId({
    customerId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    customerId: Branch["customerId"];
    filterOptions?: FilterBranchDto | null;
    sortOptions?: SortBranchDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Branch[]>;

  /**
   * List global (lintas customer) untuk tabel Branch mandiri — customerId
   * opsional sebagai filter. Hasil membawa `customerName` (join ke customer).
   */
  abstract findMany({
    customerId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    customerId?: Branch["customerId"] | null;
    filterOptions?: FilterBranchDto | null;
    sortOptions?: SortBranchDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Branch[]>;

  abstract countMany(
    customerId?: Branch["customerId"] | null,
    filterOptions?: FilterBranchDto | null,
  ): Promise<number>;

  abstract findById(id: Branch["id"]): Promise<NullableType<Branch>>;

  abstract findHeadOfficeByCustomerId(
    customerId: Branch["customerId"],
  ): Promise<NullableType<Branch>>;

  abstract countByCustomerId(
    customerId: Branch["customerId"],
    filterOptions?: FilterBranchDto | null,
  ): Promise<number>;

  abstract update(
    id: Branch["id"],
    payload: DeepPartial<Branch>,
  ): Promise<Branch | null>;

  abstract remove(id: Branch["id"]): Promise<void>;
}
