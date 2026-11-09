import { CreateBranchDto } from "../dto/create-branch.dto";
import { UpdateBranchDto } from "../dto/update-branch.dto";
import { FilterBranchDto, SortBranchDto } from "../dto/query-branch.dto";
import { Branch } from "../domain/branch";
import { CustomerRepository } from "../infrastructure/persistence/customer.repository";
import { BranchRepository } from "../infrastructure/persistence/branch.repository";
import { NullableType } from "../../utils/types/nullable.type";
import { IPaginationOptions } from "../../utils/types/pagination-options";
import { RegionValidationService } from "./region-validation.service";
import { StaffRepository } from "../infrastructure/persistence/staff.repository";
import { CustomerModuleOptions } from "../customer.options";
export declare class BranchService {
    private readonly branchRepository;
    private readonly customerRepository;
    private readonly regionValidation;
    private readonly staffRepository;
    private readonly moduleOptions?;
    constructor(branchRepository: BranchRepository, customerRepository: CustomerRepository, regionValidation: RegionValidationService, staffRepository: StaffRepository, moduleOptions?: CustomerModuleOptions | undefined);
    create(customerId: Branch["customerId"], createBranchDto: CreateBranchDto, actorUserId: number): Promise<Branch>;
    findManyByCustomerId({ customerId, filterOptions, sortOptions, paginationOptions, }: {
        customerId: Branch["customerId"];
        filterOptions?: FilterBranchDto | null;
        sortOptions?: SortBranchDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Branch[]>;
    /**
     * List branch global (lintas customer) untuk tabel Branch mandiri.
     * `customerId` bersifat filter opsional — divalidasi bila diisi.
     */
    findMany({ customerId, filterOptions, sortOptions, paginationOptions, scope, }: {
        customerId?: Branch["customerId"] | null;
        scope?: {
            global: boolean;
            customerIds: readonly string[];
            branchIds: readonly string[];
        };
        filterOptions?: FilterBranchDto | null;
        sortOptions?: SortBranchDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Branch[]>;
    countMany(customerId?: Branch["customerId"] | null, filterOptions?: FilterBranchDto | null, scope?: {
        global: boolean;
        customerIds: readonly string[];
        branchIds: readonly string[];
    }): Promise<number>;
    private assertCustomerExists;
    countByCustomerId(customerId: Branch["customerId"], filterOptions?: FilterBranchDto | null): Promise<number>;
    findBranchById(id: Branch["id"]): Promise<NullableType<Branch>>;
    update(id: Branch["id"], updateBranchDto: UpdateBranchDto): Promise<Branch>;
    remove(id: Branch["id"]): Promise<void>;
    /**
     * Friendly pre-check for the max-1-head-office rule. The partial unique
     * index `UQ_branch_headOffice` is the hard guarantee; this only surfaces a
     * readable error instead of a constraint violation.
     */
    private assertHeadOfficeAvailable;
}
