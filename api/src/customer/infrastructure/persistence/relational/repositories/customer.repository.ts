import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterCustomerDto, SortCustomerDto } from '../../../../dto/query-customer.dto';
import { Customer } from '../../../../domain/customer';
import { CustomerRepository } from '../../customer.repository';
import { CustomerMapper } from '../mappers/customer.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class CustomersRelationalRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async create(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'ulid' | 'code'>,
  ): Promise<Customer> {
    const persistenceModel = CustomerMapper.toPersistence(data as Customer);
    const newEntity = await this.customerRepository.save(
      this.customerRepository.create(persistenceModel),
    );
    // Kolom `code` diisi oleh trigger AFTER INSERT di database, sehingga tidak
    // terbawa oleh nilai kembalian save(). Baca ulang baris untuk memuatnya.
    const savedEntity = await this.customerRepository.findOneByOrFail({
      id: newEntity.id,
    });
    return CustomerMapper.toDomain(savedEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCustomerDto | null;
    sortOptions?: SortCustomerDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Customer[]> {
    const where: FindOptionsWhere<CustomerEntity> = {};
    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.isActive !== undefined) {
      where.isActive = filterOptions.isActive;
    }

    const entities = await this.customerRepository.find({
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

    return entities.map((customer) => CustomerMapper.toDomain(customer));
  }

  async findById(id: Customer['id']): Promise<NullableType<Customer>> {
    const entity = await this.customerRepository.findOne({
      where: { id: BigInt(id) },
    });
    return entity ? CustomerMapper.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<NullableType<Customer>> {
    const entity = await this.customerRepository.findOne({
      where: { name },
    });
    return entity ? CustomerMapper.toDomain(entity) : null;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.customerRepository.count({ where: { name } });
    return count > 0;
  }

  async countWithFilter(
    filterOptions?: FilterCustomerDto | null,
  ): Promise<number> {
    const where: FindOptionsWhere<CustomerEntity> = {};
    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name}%`);
    }
    if (filterOptions?.isActive !== undefined) {
      where.isActive = filterOptions.isActive;
    }
    return this.customerRepository.count({ where });
  }

  async update(
    id: Customer['id'],
    payload: Partial<Customer>,
  ): Promise<Customer | null> {
    const entity = await this.customerRepository.findOne({
      where: { id: BigInt(id) },
    });

    if (!entity) {
      return null;
    }

    // TypeORM memperlakukan id berupa BigInt sebagai "tanpa id" pada
    // save() (entitas dianggap baru -> INSERT). Gunakan update() + baca ulang.
    const persistenceModel = CustomerMapper.toPersistence({
      ...CustomerMapper.toDomain(entity),
      ...payload,
    });
    delete persistenceModel.id; // tidak boleh masuk klausa SET
    delete persistenceModel.ulid; // immutable
    delete persistenceModel.code; // diisi trigger AFTER INSERT
    await this.customerRepository.update({ id: BigInt(id) }, persistenceModel);

    const updatedEntity = await this.customerRepository.findOneByOrFail({
      id: BigInt(id),
    });
    return CustomerMapper.toDomain(updatedEntity);
  }

  async remove(id: Customer['id']): Promise<void> {
    await this.customerRepository.delete({ id: BigInt(id) });
  }
}
