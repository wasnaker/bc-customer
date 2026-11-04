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
    constructor(customerService: CustomerService, branchService: BranchService, staffService: StaffService, customerDocumentService: CustomerDocumentService);
    createDocument(createCustomerDocumentDto: CreateCustomerDocumentDto): Promise<CustomerDocument>;
    findDocuments(query: QueryCustomerDocumentDto): Promise<InfinityPaginationResponseDto<CustomerDocument>>;
    updateDocument(id: string, updateCustomerDocumentDto: UpdateCustomerDocumentDto): Promise<CustomerDocument>;
    removeDocument(id: string): Promise<void>;
    findAllBranches(query: QueryBranchDto): Promise<InfinityPaginationResponseDto<Branch>>;
    createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    findCustomers(query: QueryCustomerDto): Promise<InfinityPaginationResponseDto<Customer>>;
    findCustomerById(id: string): Promise<NullableType<Customer>>;
    updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    removeCustomer(id: string): Promise<void>;
    createBranch(customerId: string, createBranchDto: CreateBranchDto): Promise<Branch>;
    findBranches(customerId: string, query: QueryBranchDto): Promise<InfinityPaginationResponseDto<Branch>>;
    findBranchById(id: string): Promise<NullableType<Branch>>;
    updateBranch(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch>;
    removeBranch(id: string): Promise<void>;
    createStaff(branchId: string, createStaffDto: CreateStaffDto): Promise<Staff>;
    findStaff(branchId: string, query: QueryStaffDto): Promise<InfinityPaginationResponseDto<Staff>>;
    findStaffById(id: string): Promise<NullableType<Staff>>;
    updateStaff(id: string, updateStaffDto: UpdateStaffDto): Promise<Staff>;
    removeStaff(id: string): Promise<void>;
}
