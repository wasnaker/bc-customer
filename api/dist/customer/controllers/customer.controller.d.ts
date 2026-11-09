import { CreateCustomerDto } from "../dto/create-customer.dto";
import { UpdateCustomerDto } from "../dto/update-customer.dto";
import { QueryCustomerDto } from "../dto/query-customer.dto";
import { CreateBranchDto } from "../dto/create-branch.dto";
import { UpdateBranchDto } from "../dto/update-branch.dto";
import { QueryBranchDto } from "../dto/query-branch.dto";
import { CreateStaffDto } from "../dto/create-staff.dto";
import { UpdateStaffDto } from "../dto/update-staff.dto";
import { QueryStaffDto } from "../dto/query-staff.dto";
import { CreateCustomerDocumentDto } from "../dto/create-customer-document.dto";
import { UpdateCustomerDocumentDto } from "../dto/update-customer-document.dto";
import { QueryCustomerDocumentDto } from "../dto/query-customer-document.dto";
import { Customer } from "../domain/customer";
import { Branch } from "../domain/branch";
import { Staff } from "../domain/staff";
import { CustomerDocument } from "../domain/customer-document";
import { CustomerService } from "../services/customer.service";
import { BranchService } from "../services/branch.service";
import { StaffService } from "../services/staff.service";
import { CustomerDocumentService } from "../services/customer-document.service";
import { CustomerModuleOptions } from "../customer.options";
import { NullableType } from "../../utils/types/nullable.type";
import { InfinityPaginationResponseDto } from "../../utils/dto/infinity-pagination-response.dto";
/**
 * The host supplies JWT authentication and resolves module-declared action
 * permissions through CustomerAccessGuard; permission = `${action}:${resource}`
 * where the resource comes from @CustomerResource metadata (default 'customer'
 * and document ownerType for polymorphic document routes).
 */
export declare class CustomerController {
    private readonly customerService;
    private readonly branchService;
    private readonly staffService;
    private readonly customerDocumentService;
    private readonly moduleOptions?;
    constructor(customerService: CustomerService, branchService: BranchService, staffService: StaffService, customerDocumentService: CustomerDocumentService, moduleOptions?: CustomerModuleOptions | undefined);
    createDocument(createCustomerDocumentDto: CreateCustomerDocumentDto): Promise<CustomerDocument>;
    findDocuments(query: QueryCustomerDocumentDto): Promise<InfinityPaginationResponseDto<CustomerDocument>>;
    updateDocument(id: string, updateCustomerDocumentDto: UpdateCustomerDocumentDto): Promise<CustomerDocument>;
    removeDocument(id: string): Promise<void>;
    findAllBranches(request: {
        customerAuthorizationScope?: {
            global: boolean;
            customerIds: string[];
            branchIds: string[];
        };
    }, query: QueryBranchDto): Promise<InfinityPaginationResponseDto<Branch>>;
    findAllStaff(request: {
        customerAuthorizationScope?: {
            global: boolean;
            customerIds: string[];
            branchIds: string[];
        };
    }, query: QueryStaffDto): Promise<InfinityPaginationResponseDto<Staff>>;
    /**
     * Returns the signed-in user's own resolved permissions/scopes for UI
     * affordances. API guards still re-evaluate every operation independently.
     */
    findMyScope(request: {
        user?: {
            id?: number | string;
        };
    }): Promise<{
        global: boolean;
        permissions: Record<string, {
            global: boolean;
            customerIds: string[];
            branchIds: string[];
        }>;
    }>;
    /**
     * Profile staff list. Scope is resolved from the dedicated Profile permission,
     * so Customer Admin receives company scope and Branch Admin receives only
     * the assigned branch scope. Client-supplied customer/branch IDs are ignored.
     */
    findMyStaff(request: {
        customerAuthorizationScope?: {
            global: boolean;
            customerIds: string[];
            branchIds: string[];
        };
    }, query: QueryStaffDto): Promise<InfinityPaginationResponseDto<Staff>>;
    /** Profile-only update endpoint; CustomerScopeGuard enforces the same role's scope. */
    updateMyStaff(id: string, updateStaffDto: UpdateStaffDto): Promise<Staff>;
    /**
     * Self-service branch lookup. The branch is derived only from the
     * authenticated user's linked staff record; no user/branch ID is accepted
     * from the client, so this endpoint cannot be used to enumerate other
     * customers or branches.
     */
    findMyBranch(request: {
        user?: {
            id?: number | string;
        };
    }): Promise<Branch & {
        staffName: string;
        staffPosition: string | null;
    }>;
    createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    findCustomers(request: {
        customerAuthorizationScope?: {
            global: boolean;
            customerIds: string[];
            branchIds: string[];
        };
    }, query: QueryCustomerDto): Promise<InfinityPaginationResponseDto<Customer>>;
    findCustomerById(id: string): Promise<NullableType<Customer>>;
    updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    removeCustomer(id: string): Promise<void>;
    createBranch(customerId: string, createBranchDto: CreateBranchDto, request: {
        user?: {
            id?: number | string;
        };
    }): Promise<Branch>;
    findBranches(customerId: string, query: QueryBranchDto): Promise<InfinityPaginationResponseDto<Branch>>;
    findBranchById(id: string): Promise<NullableType<Branch>>;
    updateBranch(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch>;
    removeBranch(id: string): Promise<void>;
    createStaff(branchId: string, createStaffDto: CreateStaffDto, request: {
        user?: {
            id?: number | string;
        };
    }): Promise<Staff>;
    findStaff(branchId: string, query: QueryStaffDto): Promise<InfinityPaginationResponseDto<Staff>>;
    findStaffById(id: string): Promise<NullableType<Staff>>;
    updateStaff(id: string, updateStaffDto: UpdateStaffDto): Promise<Staff>;
    removeStaff(id: string): Promise<void>;
}
