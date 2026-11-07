import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { FindOptionsWhere, ILike, In, Repository } from "typeorm";
import { StaffEntity } from "../entities/staff.entity";
import { BranchEntity } from "../entities/branch.entity";
import { NullableType } from "../../../../../utils/types/nullable.type";
import { FilterStaffDto, SortStaffDto } from "../../../../dto/query-staff.dto";
import { Staff } from "../../../../domain/staff";
import { StaffRepository } from "../../staff.repository";
import { StaffMapper } from "../mappers/staff.mapper";
import { IPaginationOptions } from "../../../../../utils/types/pagination-options";

@Injectable()
export class StaffRelationalRepository implements StaffRepository {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
  ) {}

  async create(
    data: Omit<Staff, "id" | "createdAt" | "updatedAt" | "ulid">,
  ): Promise<Staff> {
    const persistenceModel = StaffMapper.toPersistence(data as Staff);
    const newEntity = await this.staffRepository.save(
      this.staffRepository.create(persistenceModel),
    );
    return StaffMapper.toDomain(newEntity);
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
    const where: FindOptionsWhere<StaffEntity> = {
      branchId: BigInt(branchId),
    };
    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.position) {
      where.position = ILike(`%${filterOptions.position}%`);
    }

    const entities = await this.staffRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        { name: "ASC" },
      ),
    });

    return entities.map((staff) => StaffMapper.toDomain(staff));
  }

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
    const baseWhere: FindOptionsWhere<StaffEntity> = {};
    if (branchId != null) {
      baseWhere.branchId = BigInt(branchId);
    } else if (customerId != null) {
      // Filter nested via relasi branch → customer.
      baseWhere.branch = { customerId: BigInt(customerId) };
    }
    if (filterOptions?.name) {
      baseWhere.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.position) {
      baseWhere.position = ILike(`%${filterOptions.position}%`);
    }

    let where: FindOptionsWhere<StaffEntity> | FindOptionsWhere<StaffEntity>[] = baseWhere;
    if (scope && !scope.global) {
      const scopedWhere: FindOptionsWhere<StaffEntity>[] = [];
      const allowedCustomers = new Set(scope.customerIds);
      if (
        scope.customerIds.length > 0 &&
        (customerId == null || allowedCustomers.has(String(customerId)))
      ) {
        scopedWhere.push({
          ...baseWhere,
          branch: {
            ...(baseWhere.branch as FindOptionsWhere<BranchEntity> | undefined),
            customerId:
              customerId != null
                ? BigInt(customerId)
                : In(scope.customerIds.map((id) => BigInt(id))),
          },
        });
      }
      if (
        scope.branchIds.length > 0 &&
        (branchId == null || scope.branchIds.includes(String(branchId)))
      ) {
        scopedWhere.push({
          ...baseWhere,
          ...(customerId != null
            ? { branch: { customerId: BigInt(customerId) } }
            : {}),
          branchId:
            branchId != null
              ? BigInt(branchId)
              : In(scope.branchIds.map((id) => BigInt(id))),
        });
      }
      if (scopedWhere.length === 0) return [];
      where = scopedWhere;
    }

    const entities = await this.staffRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      // Relasi branch+customer hanya untuk list global — kolom nama
      // cabang/pelanggan dibutuhkan tabel Staff mandiri.
      relations: branchId == null ? { branch: { customer: true } } : undefined,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        { name: "ASC" },
      ),
    });

    return entities.map((staff) => StaffMapper.toDomain(staff));
  }

  async countMany(
    branchId?: Staff["branchId"] | null,
    filterOptions?: FilterStaffDto | null,
    customerId?: Staff["branchId"] | null,
    scope?: { global: boolean; customerIds: readonly string[]; branchIds: readonly string[] },
  ): Promise<number> {
    const baseWhere: FindOptionsWhere<StaffEntity> = {};
    if (branchId != null) {
      baseWhere.branchId = BigInt(branchId);
    } else if (customerId != null) {
      baseWhere.branch = { customerId: BigInt(customerId) };
    }
    if (filterOptions?.name) {
      baseWhere.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.position) {
      baseWhere.position = ILike(`%${filterOptions.position}%`);
    }

    let where: FindOptionsWhere<StaffEntity> | FindOptionsWhere<StaffEntity>[] = baseWhere;
    if (scope && !scope.global) {
      const scopedWhere: FindOptionsWhere<StaffEntity>[] = [];
      const allowedCustomers = new Set(scope.customerIds);
      if (
        scope.customerIds.length > 0 &&
        (customerId == null || allowedCustomers.has(String(customerId)))
      ) {
        scopedWhere.push({
          ...baseWhere,
          branch: {
            ...(baseWhere.branch as FindOptionsWhere<BranchEntity> | undefined),
            customerId:
              customerId != null
                ? BigInt(customerId)
                : In(scope.customerIds.map((id) => BigInt(id))),
          },
        });
      }
      if (
        scope.branchIds.length > 0 &&
        (branchId == null || scope.branchIds.includes(String(branchId)))
      ) {
        scopedWhere.push({
          ...baseWhere,
          ...(customerId != null
            ? { branch: { customerId: BigInt(customerId) } }
            : {}),
          branchId:
            branchId != null
              ? BigInt(branchId)
              : In(scope.branchIds.map((id) => BigInt(id))),
        });
      }
      if (scopedWhere.length === 0) return 0;
      where = scopedWhere;
    }
    return this.staffRepository.count({ where });
  }

  async findById(id: Staff["id"]): Promise<NullableType<Staff>> {
    const entity = await this.staffRepository.findOne({
      where: { id: BigInt(id) },
    });
    return entity ? StaffMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<NullableType<Staff>> {
    const entity = await this.staffRepository.findOne({
      where: { userId },
    });
    return entity ? StaffMapper.toDomain(entity) : null;
  }

  async countByBranchId(
    branchId: Staff["branchId"],
    filterOptions?: FilterStaffDto | null,
  ): Promise<number> {
    const where: FindOptionsWhere<StaffEntity> = {
      branchId: BigInt(branchId),
    };
    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.position) {
      where.position = ILike(`%${filterOptions.position}%`);
    }
    return this.staffRepository.count({ where });
  }

  async update(
    id: Staff["id"],
    payload: Partial<Staff>,
  ): Promise<Staff | null> {
    const entity = await this.staffRepository.findOne({
      where: { id: BigInt(id) },
    });

    if (!entity) {
      return null;
    }

    // TypeORM memperlakukan id berupa BigInt sebagai "tanpa id" pada
    // save() (entitas dianggap baru -> INSERT). Gunakan update() + baca ulang.
    const persistenceModel = StaffMapper.toPersistence({
      ...StaffMapper.toDomain(entity),
      ...payload,
    }) as Partial<StaffEntity>;
    delete persistenceModel.id; // tidak boleh masuk klausa SET
    delete persistenceModel.ulid; // immutable
    await this.staffRepository.update({ id: BigInt(id) }, persistenceModel);

    const updatedEntity = await this.staffRepository.findOneByOrFail({
      id: BigInt(id),
    });
    return StaffMapper.toDomain(updatedEntity);
  }

  async remove(id: Staff["id"]): Promise<void> {
    await this.staffRepository.delete({ id: BigInt(id) });
  }
}
