import { QueryFailedError } from 'typeorm';
import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCustomerDocumentDto } from '../dto/create-customer-document.dto';
import { UpdateCustomerDocumentDto } from '../dto/update-customer-document.dto';
import {
  FilterCustomerDocumentDto,
  SortCustomerDocumentDto,
} from '../dto/query-customer-document.dto';
import { CustomerDocument } from '../domain/customer-document';
import { CustomerDocumentRepository } from '../infrastructure/persistence/customer-document.repository';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';

@Injectable()
export class CustomerDocumentService {
  constructor(
    private readonly customerDocumentRepository: CustomerDocumentRepository,
  ) {}

  async create(
    createCustomerDocumentDto: CreateCustomerDocumentDto,
  ): Promise<CustomerDocument> {
    if (!createCustomerDocumentDto.fileId) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          fileId: 'fileIdRequired',
        },
      });
    }

    try {
      return await this.customerDocumentRepository.create({
        ownerType: createCustomerDocumentDto.ownerType,
        ownerId: BigInt(createCustomerDocumentDto.ownerId),
        type: createCustomerDocumentDto.type,
        number: createCustomerDocumentDto.number ?? null,
        fileId: createCustomerDocumentDto.fileId,
        issuedAt: createCustomerDocumentDto.issuedAt ?? null,
        expiresAt: createCustomerDocumentDto.expiresAt ?? null,
        isActive: createCustomerDocumentDto.isActive ?? true,
      });
    } catch (error) {
      // FK ke tabel `file` milik host — petakan pelanggaran menjadi 422.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23503'
      ) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            fileId: 'fileNotFound',
          },
        });
      }
      throw error;
    }
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
    return this.customerDocumentRepository.findManyByOwner({
      ownerType,
      ownerId: BigInt(ownerId),
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  async countByOwner(
    ownerType: CustomerDocument['ownerType'],
    ownerId: CustomerDocument['ownerId'],
    filterOptions?: FilterCustomerDocumentDto | null,
  ): Promise<number> {
    return this.customerDocumentRepository.countByOwner(
      ownerType,
      BigInt(ownerId),
      filterOptions,
    );
  }

  async findDocumentById(
    id: CustomerDocument['id'],
  ): Promise<NullableType<CustomerDocument>> {
    return this.customerDocumentRepository.findById(id);
  }

  async update(
    id: CustomerDocument['id'],
    updateCustomerDocumentDto: UpdateCustomerDocumentDto,
  ): Promise<CustomerDocument> {
    const document = await this.customerDocumentRepository.findById(id);
    if (!document) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          document: 'customerDocumentNotExists',
        },
      });
    }

    const payload: Partial<CustomerDocument> = {
      ...updateCustomerDocumentDto,
    };
    if (updateCustomerDocumentDto.ownerId !== undefined) {
      payload.ownerId = BigInt(updateCustomerDocumentDto.ownerId);
    }

    const updated = await this.customerDocumentRepository.update(id, payload);
    if (!updated) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          document: 'customerDocumentNotExists',
        },
      });
    }
    return updated;
  }

  async remove(id: CustomerDocument['id']): Promise<void> {
    const document = await this.customerDocumentRepository.findById(id);
    if (!document) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          document: 'customerDocumentNotExists',
        },
      });
    }

    await this.customerDocumentRepository.remove(id);
  }
}
