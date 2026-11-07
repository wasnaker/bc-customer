import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, Repository } from 'typeorm';
import { CustomerDocumentEntity } from '../entities/customer-document.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import {
  FilterCustomerDocumentDto,
  SortCustomerDocumentDto,
} from '../../../../dto/query-customer-document.dto';
import { CustomerDocument } from '../../../../domain/customer-document';
import { CustomerDocumentRepository } from '../../customer-document.repository';
import { CustomerDocumentMapper } from '../mappers/customer-document.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class CustomerDocumentsRelationalRepository
  implements CustomerDocumentRepository
{
  constructor(
    @InjectRepository(CustomerDocumentEntity)
    private readonly customerDocumentRepository: Repository<CustomerDocumentEntity>,
  ) {}

  async create(
    data: Omit<CustomerDocument,
      'id' | 'createdAt' | 'updatedAt' | 'ulid'>,
  ): Promise<CustomerDocument> {
    const persistenceModel = CustomerDocumentMapper.toPersistence(
      data as CustomerDocument,
    );
    const newEntity = await this.customerDocumentRepository.save(
      this.customerDocumentRepository.create(persistenceModel),
    );
    return CustomerDocumentMapper.toDomain(newEntity);
  }

  async findManyByOwner({
    ownerType,
    ownerId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    ownerType: CustomerDocument['ownerType'];
    ownerId: CustomerDocument['ownerId'];
    filterOptions?: FilterCustomerDocumentDto | null;
    sortOptions?: SortCustomerDocumentDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<CustomerDocument[]> {
    const where: FindOptionsWhere<CustomerDocumentEntity> = {
      ownerType,
      ownerId: BigInt(ownerId),
    };
    if (filterOptions?.type) {
      where.type = filterOptions.type;
    }

    const entities = await this.customerDocumentRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        { createdAt: 'DESC' },
      ),
    });

    return entities.map((document) => CustomerDocumentMapper.toDomain(document));
  }

  async findById(
    id: CustomerDocument['id'],
  ): Promise<NullableType<CustomerDocument>> {
    const entity = await this.customerDocumentRepository.findOne({
      where: { id: BigInt(id) },
    });
    return entity ? CustomerDocumentMapper.toDomain(entity) : null;
  }

  async countByOwner(
    ownerType: CustomerDocument['ownerType'],
    ownerId: CustomerDocument['ownerId'],
    filterOptions?: FilterCustomerDocumentDto | null,
  ): Promise<number> {
    const where: FindOptionsWhere<CustomerDocumentEntity> = {
      ownerType,
      ownerId: BigInt(ownerId),
    };
    if (filterOptions?.type) {
      where.type = filterOptions.type;
    }
    return this.customerDocumentRepository.count({ where });
  }

  async update(
    id: CustomerDocument['id'],
    payload: Partial<CustomerDocument>,
  ): Promise<CustomerDocument | null> {
    const entity = await this.customerDocumentRepository.findOne({
      where: { id: BigInt(id) },
    });

    if (!entity) {
      return null;
    }

    // TypeORM memperlakukan id berupa BigInt sebagai "tanpa id" pada
    // save() (entitas dianggap baru -> INSERT). Gunakan update() + baca ulang.
    const persistenceModel = CustomerDocumentMapper.toPersistence({
      ...CustomerDocumentMapper.toDomain(entity),
      ...payload,
    }) as Partial<CustomerDocumentEntity>;
    delete persistenceModel.id; // tidak boleh masuk klausa SET
    delete persistenceModel.ulid; // immutable
    await this.customerDocumentRepository.update({ id: BigInt(id) }, persistenceModel);

    const updatedEntity = await this.customerDocumentRepository.findOneByOrFail({
      id: BigInt(id),
    });
    return CustomerDocumentMapper.toDomain(updatedEntity);
  }

  async remove(id: CustomerDocument['id']): Promise<void> {
    await this.customerDocumentRepository.delete({ id: BigInt(id) });
  }
}
