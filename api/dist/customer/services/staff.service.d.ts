import { CreateStaffDto } from "../dto/create-staff.dto";
import { UpdateStaffDto } from "../dto/update-staff.dto";
import { FilterStaffDto, SortStaffDto } from "../dto/query-staff.dto";
import { Staff } from "../domain/staff";
import { BranchRepository } from "../infrastructure/persistence/branch.repository";
import { CustomerRepository } from "../infrastructure/persistence/customer.repository";
import { StaffRepository } from "../infrastructure/persistence/staff.repository";
import { NullableType } from "../../utils/types/nullable.type";
import { IPaginationOptions } from "../../utils/types/pagination-options";
import { RegionValidationService } from "./region-validation.service";
import { CustomerModuleOptions } from "../customer.options";
import { CustomerCoreAccountProvisioningClient } from "../customer-core-account-provisioning.client";
import { CustomerCoreUserDirectoryClient } from "../customer-core-user-directory.client";
export declare class StaffService {
    private readonly staffRepository;
    private readonly branchRepository;
    private readonly customerRepository;
    private readonly regionValidation;
    private readonly moduleOptions?;
    private readonly coreUsers?;
    private readonly accountProvisioning?;
    constructor(staffRepository: StaffRepository, branchRepository: BranchRepository, customerRepository: CustomerRepository, regionValidation: RegionValidationService, moduleOptions?: CustomerModuleOptions | undefined, coreUsers?: CustomerCoreUserDirectoryClient | undefined, accountProvisioning?: CustomerCoreAccountProvisioningClient | undefined);
    create(branchId: Staff["branchId"], createStaffDto: CreateStaffDto, actorUserId: number): Promise<Staff>;
    findManyByBranchId({ branchId, filterOptions, sortOptions, paginationOptions, }: {
        branchId: Staff["branchId"];
        filterOptions?: FilterStaffDto | null;
        sortOptions?: SortStaffDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Staff[]>;
    countByBranchId(branchId: Staff["branchId"], filterOptions?: FilterStaffDto | null): Promise<number>;
    /**
     * List staff global (lintas branch) untuk tabel Staff mandiri.
     * `branchId` bersifat filter opsional — divalidasi bila diisi.
     */
    findMany({ branchId, customerId, filterOptions, sortOptions, paginationOptions, scope, }: {
        branchId?: Staff["branchId"] | null;
        customerId?: Staff["branchId"] | null;
        scope?: {
            global: boolean;
            customerIds: readonly string[];
            branchIds: readonly string[];
        };
        filterOptions?: FilterStaffDto | null;
        sortOptions?: SortStaffDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Staff[]>;
    countMany(branchId?: Staff["branchId"] | null, filterOptions?: FilterStaffDto | null, customerId?: Staff["branchId"] | null, scope?: {
        global: boolean;
        customerIds: readonly string[];
        branchIds: readonly string[];
    }): Promise<number>;
    private assertCustomerExists;
    private assertBranchExists;
    findStaffById(id: Staff["id"]): Promise<NullableType<Staff>>;
    /** Resolve the signed-in host account to its single linked staff record. */
    findStaffByUserId(userId: number): Promise<NullableType<Staff>>;
    update(id: Staff["id"], updateStaffDto: UpdateStaffDto): Promise<Staff>;
    remove(id: Staff["id"]): Promise<void>;
}
