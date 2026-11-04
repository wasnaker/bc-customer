import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { StaffEntity } from "../entities/staff.entity";
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
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    branchId?: Staff["branchId"] | null;
    filterOptions?: FilterStaffDto | null;
    sortOptions?: SortStaffDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Staff[]> {
    const where: FindOptionsWhere<StaffEntity> = {};
    if (branchId != null) {
      where.branchId = BigInt(branchId);
    }
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
  ): Promise<number> {
    const where: FindOptionsWhere<StaffEntity> = {};
    if (branchId != null) {
      where.branchId = BigInt(branchId);
    }
    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.position) {
      where.position = ILike(`%${filterOptions.position}%`);
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
