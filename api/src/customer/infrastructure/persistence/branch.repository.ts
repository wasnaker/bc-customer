import { DeepPartial } from "../../../utils/types/deep-partial.type";
import { NullableType } from "../../../utils/types/nullable.type";
import { IPaginationOptions } from "../../../utils/types/pagination-options";
import { Branch } from "../../domain/branch";
import type { EntityManager } from "typeorm";

import { FilterBranchDto, SortBranchDto } from "../../dto/query-branch.dto";

export abstract class BranchRepository {
  /** Reserve a PostgreSQL-generated id before external account provisioning. */
  abstract reserveId(): Promise<Branch["id"]>;

  abstract create(
    data: Omit<Branch, "id" | "createdAt" | "updatedAt" | "ulid" | "code">,
    manager?: EntityManager,
    id?: Branch["id"],
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
    scope,
  }: {
    customerId?: Branch["customerId"] | null;
    scope?: { global: boolean; customerIds: readonly string[]; branchIds: readonly string[] };
    filterOptions?: FilterBranchDto | null;
    sortOptions?: SortBranchDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Branch[]>;

  abstract countMany(
    customerId?: Branch["customerId"] | null,
    filterOptions?: FilterBranchDto | null,
    scope?: { global: boolean; customerIds: readonly string[]; branchIds: readonly string[] },
  ): Promise<number>;

  abstract findById(
    id: Branch["id"],
    manager?: EntityManager,
  ): Promise<NullableType<Branch>>;

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
    manager?: EntityManager,
  ): Promise<Branch | null>;

  abstract remove(id: Branch["id"], manager?: EntityManager): Promise<void>;
}
