import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { FilterBranchDto, SortBranchDto } from '../dto/query-branch.dto';
import { Branch } from '../domain/branch';
import { CustomerRepository } from '../infrastructure/persistence/customer.repository';
import { BranchRepository } from '../infrastructure/persistence/branch.repository';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { RegionValidationService } from './region-validation.service';
export declare class BranchService {
    private readonly branchRepository;
    private readonly customerRepository;
    private readonly regionValidation;
    constructor(branchRepository: BranchRepository, customerRepository: CustomerRepository, regionValidation: RegionValidationService);
    create(customerId: Branch['customerId'], createBranchDto: CreateBranchDto): Promise<Branch>;
    findManyByCustomerId({ customerId, filterOptions, sortOptions, paginationOptions, }: {
        customerId: Branch['customerId'];
        filterOptions?: FilterBranchDto | null;
        sortOptions?: SortBranchDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Branch[]>;
    countByCustomerId(customerId: Branch['customerId'], filterOptions?: FilterBranchDto | null): Promise<number>;
    findBranchById(id: Branch['id']): Promise<NullableType<Branch>>;
    update(id: Branch['id'], updateBranchDto: UpdateBranchDto): Promise<Branch>;
    remove(id: Branch['id']): Promise<void>;
    /**
     * Friendly pre-check for the max-1-head-office rule. The partial unique
     * index `UQ_branch_headOffice` is the hard guarantee; this only surfaces a
     * readable error instead of a constraint violation.
     */
    private assertHeadOfficeAvailable;
}
