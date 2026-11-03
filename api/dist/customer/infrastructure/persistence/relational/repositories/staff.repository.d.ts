import { Repository } from 'typeorm';
import { StaffEntity } from '../entities/staff.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterStaffDto, SortStaffDto } from '../../../../dto/query-staff.dto';
import { Staff } from '../../../../domain/staff';
import { StaffRepository } from '../../staff.repository';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
export declare class StaffRelationalRepository implements StaffRepository {
    private readonly staffRepository;
    constructor(staffRepository: Repository<StaffEntity>);
    create(data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt' | 'ulid'>): Promise<Staff>;
    findManyByBranchId({ branchId, filterOptions, sortOptions, paginationOptions, }: {
        branchId: Staff['branchId'];
        filterOptions?: FilterStaffDto | null;
        sortOptions?: SortStaffDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Staff[]>;
    findById(id: Staff['id']): Promise<NullableType<Staff>>;
    findByUserId(userId: number): Promise<NullableType<Staff>>;
    countByBranchId(branchId: Staff['branchId'], filterOptions?: FilterStaffDto | null): Promise<number>;
    update(id: Staff['id'], payload: Partial<Staff>): Promise<Staff | null>;
    remove(id: Staff['id']): Promise<void>;
}
