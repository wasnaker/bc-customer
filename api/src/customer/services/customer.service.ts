import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { FilterCustomerDto, SortCustomerDto } from '../dto/query-customer.dto';
import { Customer } from '../domain/customer';
import { Branch } from '../domain/branch';
import { CustomerRepository } from '../infrastructure/persistence/customer.repository';
import { BranchRepository } from '../infrastructure/persistence/branch.repository';
import { CustomerEntity } from '../infrastructure/persistence/relational/entities/customer.entity';
import { BranchEntity } from '../infrastructure/persistence/relational/entities/branch.entity';
import { CustomerMapper } from '../infrastructure/persistence/relational/mappers/customer.mapper';
import { BranchMapper } from '../infrastructure/persistence/relational/mappers/branch.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { RegionValidationService } from './region-validation.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly branchRepository: BranchRepository,
    private readonly regionValidation: RegionValidationService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerRepository.findByName(
      createCustomerDto.name,
    );
    if (existing) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          name: 'customerNameAlreadyExists',
        },
      });
    }

    // Region is a hard dependency — validate the HO branch address against
    // the region tables (raw queries, no region module imports).
    await this.regionValidation.assertRegionPair(
      createCustomerDto.headOffice.provinceId,
      createCustomerDto.headOffice.cityId,
    );

    // Contract J1: a customer is ALWAYS created together with its head-office
    // branch — both rows or neither.
    const created = await this.dataSource.transaction(async (manager) => {
      const customerEntity = await manager.save(
        manager.create(CustomerEntity, CustomerMapper.toPersistence({
          name: createCustomerDto.name,
          userId: createCustomerDto.userId ?? null,
          npwpNumber: createCustomerDto.npwpNumber ?? null,
          nibNumber: createCustomerDto.nibNumber ?? null,
          isActive: createCustomerDto.isActive ?? true,
        } as Customer)),
      );

      const headOfficeEntity = await manager.save(
        manager.create(BranchEntity, BranchMapper.toPersistence({
          customerId: customerEntity.id,
          name: createCustomerDto.headOffice.name,
          isHeadOffice: true,
          addressLine: createCustomerDto.headOffice.addressLine,
          provinceId: createCustomerDto.headOffice.provinceId,
          cityId: createCustomerDto.headOffice.cityId,
          postalCode: createCustomerDto.headOffice.postalCode ?? null,
          vatNumber: createCustomerDto.headOffice.vatNumber ?? null,
          vatType: createCustomerDto.headOffice.vatType ?? 'npwp',
          isActive: true,
        } as Branch)),
      );

      // `code` diisi trigger AFTER INSERT — baca ulang baris agar nilainya
      // terbawa dalam respons (save() hanya mengembalikan nilai yang di-insert).
      const [savedCustomerEntity, savedHeadOfficeEntity] = await Promise.all([
        manager.findOneByOrFail(CustomerEntity, { id: customerEntity.id }),
        manager.findOneByOrFail(BranchEntity, { id: headOfficeEntity.id }),
      ]);

      const customer = CustomerMapper.toDomain(savedCustomerEntity);
      customer.headOffice = BranchMapper.toDomain(savedHeadOfficeEntity);
      return customer;
    });

    return created;
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
    return this.customerRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async countWithFilter(
    filterOptions?: FilterCustomerDto | null,
  ): Promise<number> {
    return this.customerRepository.countWithFilter(filterOptions);
  }

  async findCustomerById(id: Customer['id']): Promise<NullableType<Customer>> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      return null;
    }
    customer.headOffice =
      (await this.branchRepository.findHeadOfficeByCustomerId(
        customer.id,
      )) ?? undefined;
    return customer;
  }

  async findHeadOffice(
    customerId: Customer['id'],
  ): Promise<NullableType<Branch>> {
    return this.branchRepository.findHeadOfficeByCustomerId(customerId);
  }

  async update(
    id: Customer['id'],
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          customer: 'customerNotExists',
        },
      });
    }

    if (updateCustomerDto.name) {
      const existing = await this.customerRepository.findByName(
        updateCustomerDto.name,
      );
      if (existing && String(existing.id) !== String(id)) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            name: 'customerNameAlreadyExists',
          },
        });
      }
    }

    const updated = await this.customerRepository.update(id, {
      ...updateCustomerDto,
    });
    if (!updated) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          customer: 'customerNotExists',
        },
      });
    }
    return updated;
  }

  async remove(id: Customer['id']): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          customer: 'customerNotExists',
        },
      });
    }

    try {
      // branch.customerId is FK CASCADE, so branches (and their staff via
      // RESTRICT) govern whether this succeeds — let the DB own integrity.
      await this.customerRepository.remove(id);
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === '23503'
      ) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            customer: 'customerHasStaff',
          },
        });
      }
      throw error;
    }
  }
}
