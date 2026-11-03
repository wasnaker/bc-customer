import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { FilterStaffDto, SortStaffDto } from '../dto/query-staff.dto';
import { Staff } from '../domain/staff';
import { BranchRepository } from '../infrastructure/persistence/branch.repository';
import { StaffRepository } from '../infrastructure/persistence/staff.repository';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { RegionValidationService } from './region-validation.service';
export declare class StaffService {
    private readonly staffRepository;
    private readonly branchRepository;
    private readonly regionValidation;
    constructor(staffRepository: StaffRepository, branchRepository: BranchRepository, regionValidation: RegionValidationService);
    create(branchId: Staff['branchId'], createStaffDto: CreateStaffDto): Promise<Staff>;
    findManyByBranchId({ branchId, filterOptions, sortOptions, paginationOptions, }: {
        branchId: Staff['branchId'];
        filterOptions?: FilterStaffDto | null;
        sortOptions?: SortStaffDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Staff[]>;
    countByBranchId(branchId: Staff['branchId'], filterOptions?: FilterStaffDto | null): Promise<number>;
    findStaffById(id: Staff['id']): Promise<NullableType<Staff>>;
    update(id: Staff['id'], updateStaffDto: UpdateStaffDto): Promise<Staff>;
    remove(id: Staff['id']): Promise<void>;
    /**
     * Friendly pre-check for the one-user-one-staff rule. The unique index
     * `UQ_staff_userId` is the hard guarantee.
     */
    private assertUserNotLinked;
}
