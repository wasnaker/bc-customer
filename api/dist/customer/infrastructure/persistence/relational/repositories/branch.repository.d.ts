import { Repository } from 'typeorm';
import { BranchEntity } from '../entities/branch.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterBranchDto, SortBranchDto } from '../../../../dto/query-branch.dto';
import { Branch } from '../../../../domain/branch';
import { BranchRepository } from '../../branch.repository';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
export declare class BranchesRelationalRepository implements BranchRepository {
    private readonly branchRepository;
    constructor(branchRepository: Repository<BranchEntity>);
    create(data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt' | 'ulid' | 'code'>): Promise<Branch>;
    findManyByCustomerId({ customerId, filterOptions, sortOptions, paginationOptions, }: {
        customerId: Branch['customerId'];
        filterOptions?: FilterBranchDto | null;
        sortOptions?: SortBranchDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Branch[]>;
    findById(id: Branch['id']): Promise<NullableType<Branch>>;
    findHeadOfficeByCustomerId(customerId: Branch['customerId']): Promise<NullableType<Branch>>;
    countByCustomerId(customerId: Branch['customerId'], filterOptions?: FilterBranchDto | null): Promise<number>;
    update(id: Branch['id'], payload: Partial<Branch>): Promise<Branch | null>;
    remove(id: Branch['id']): Promise<void>;
}
