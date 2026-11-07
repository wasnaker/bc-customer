import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { FindOptionsWhere, ILike, In, Repository } from "typeorm";
import { BranchEntity } from "../entities/branch.entity";
import { NullableType } from "../../../../../utils/types/nullable.type";
import {
  FilterBranchDto,
  SortBranchDto,
} from "../../../../dto/query-branch.dto";
import { Branch } from "../../../../domain/branch";
import { BranchRepository } from "../../branch.repository";
import { BranchMapper } from "../mappers/branch.mapper";
import { IPaginationOptions } from "../../../../../utils/types/pagination-options";

@Injectable()
export class BranchesRelationalRepository implements BranchRepository {
  constructor(
    @InjectRepository(BranchEntity)
    private readonly branchRepository: Repository<BranchEntity>,
  ) {}

  async create(
    data: Omit<Branch, "id" | "createdAt" | "updatedAt" | "ulid" | "code">,
  ): Promise<Branch> {
    const persistenceModel = BranchMapper.toPersistence(data as Branch);
    const newEntity = await this.branchRepository.save(
      this.branchRepository.create(persistenceModel),
    );
    // Kolom `code` diisi oleh trigger AFTER INSERT di database, sehingga tidak
    // terbawa oleh nilai kembalian save(). Baca ulang baris untuk memuatnya.
    const savedEntity = await this.branchRepository.findOneByOrFail({
      id: newEntity.id,
    });
    return BranchMapper.toDomain(savedEntity);
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
    const where: FindOptionsWhere<BranchEntity> = {
      customerId: BigInt(customerId),
    };
    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.isHeadOffice !== undefined) {
      where.isHeadOffice = filterOptions.isHeadOffice;
    }

    const entities = await this.branchRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        { isHeadOffice: "DESC", name: "ASC" },
      ),
    });

    return entities.map((branch) => BranchMapper.toDomain(branch));
  }

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
    const baseWhere: FindOptionsWhere<BranchEntity> = {};
    if (customerId != null) {
      baseWhere.customerId = BigInt(customerId);
    }
    if (filterOptions?.name) {
      baseWhere.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.isHeadOffice !== undefined) {
      baseWhere.isHeadOffice = filterOptions.isHeadOffice;
    }

    let where: FindOptionsWhere<BranchEntity> | FindOptionsWhere<BranchEntity>[] = baseWhere;
    if (scope && !scope.global) {
      const scopedWhere: FindOptionsWhere<BranchEntity>[] = [];
      if (scope.customerIds.length > 0) {
        scopedWhere.push({
          ...baseWhere,
          customerId: In(scope.customerIds.map((id) => BigInt(id))),
        });
      }
      if (scope.branchIds.length > 0) {
        scopedWhere.push({
          ...baseWhere,
          id: In(scope.branchIds.map((id) => BigInt(id))),
        });
      }
      if (scopedWhere.length === 0) return [];
      where = scopedWhere;
    }

    const entities = await this.branchRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      // Relasi customer+staff hanya untuk list global — nama customer dan
      // email admin (via staff) dibutuhkan tabel Branch mandiri.
      relations:
        customerId == null ? { customer: true, staff: true } : undefined,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        { isHeadOffice: "DESC", name: "ASC" },
      ),
    });

    return entities.map((branch) => BranchMapper.toDomain(branch));
  }

  async countMany(
    customerId?: Branch["customerId"] | null,
    filterOptions?: FilterBranchDto | null,
    scope?: { global: boolean; customerIds: readonly string[]; branchIds: readonly string[] },
  ): Promise<number> {
    const baseWhere: FindOptionsWhere<BranchEntity> = {};
    if (customerId != null) {
      baseWhere.customerId = BigInt(customerId);
    }
    if (filterOptions?.name) {
      baseWhere.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.isHeadOffice !== undefined) {
      baseWhere.isHeadOffice = filterOptions.isHeadOffice;
    }

    let where: FindOptionsWhere<BranchEntity> | FindOptionsWhere<BranchEntity>[] = baseWhere;
    if (scope && !scope.global) {
      const scopedWhere: FindOptionsWhere<BranchEntity>[] = [];
      if (scope.customerIds.length > 0) {
        scopedWhere.push({
          ...baseWhere,
          customerId: In(scope.customerIds.map((id) => BigInt(id))),
        });
      }
      if (scope.branchIds.length > 0) {
        scopedWhere.push({
          ...baseWhere,
          id: In(scope.branchIds.map((id) => BigInt(id))),
        });
      }
      if (scopedWhere.length === 0) return 0;
      where = scopedWhere;
    }
    return this.branchRepository.count({ where });
  }

  async findById(id: Branch["id"]): Promise<NullableType<Branch>> {
    const entity = await this.branchRepository.findOne({
      where: { id: BigInt(id) },
    });
    return entity ? BranchMapper.toDomain(entity) : null;
  }

  async findHeadOfficeByCustomerId(
    customerId: Branch["customerId"],
  ): Promise<NullableType<Branch>> {
    const entity = await this.branchRepository.findOne({
      where: { customerId: BigInt(customerId), isHeadOffice: true },
    });
    return entity ? BranchMapper.toDomain(entity) : null;
  }

  async countByCustomerId(
    customerId: Branch["customerId"],
    filterOptions?: FilterBranchDto | null,
  ): Promise<number> {
    const where: FindOptionsWhere<BranchEntity> = {
      customerId: BigInt(customerId),
    };
    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.isHeadOffice !== undefined) {
      where.isHeadOffice = filterOptions.isHeadOffice;
    }
    return this.branchRepository.count({ where });
  }

  async update(
    id: Branch["id"],
    payload: Partial<Branch>,
  ): Promise<Branch | null> {
    const entity = await this.branchRepository.findOne({
      where: { id: BigInt(id) },
    });

    if (!entity) {
      return null;
    }

    // TypeORM memperlakukan id berupa BigInt sebagai "tanpa id" pada
    // save() (entitas dianggap baru -> INSERT). Gunakan update() + baca ulang.
    const persistenceModel = BranchMapper.toPersistence({
      ...BranchMapper.toDomain(entity),
      ...payload,
    }) as Partial<BranchEntity>;
    delete persistenceModel.id; // tidak boleh masuk klausa SET
    delete persistenceModel.ulid; // immutable
    delete persistenceModel.code; // diisi trigger AFTER INSERT
    await this.branchRepository.update({ id: BigInt(id) }, persistenceModel);

    const updatedEntity = await this.branchRepository.findOneByOrFail({
      id: BigInt(id),
    });
    return BranchMapper.toDomain(updatedEntity);
  }

  async remove(id: Branch["id"]): Promise<void> {
    await this.branchRepository.delete({ id: BigInt(id) });
  }
}
