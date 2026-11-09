import { Repository, EntityManager } from "typeorm";
import { BranchEntity } from "../entities/branch.entity";
import { NullableType } from "../../../../../utils/types/nullable.type";
import { FilterBranchDto, SortBranchDto } from "../../../../dto/query-branch.dto";
import { Branch } from "../../../../domain/branch";
import { BranchRepository } from "../../branch.repository";
import { IPaginationOptions } from "../../../../../utils/types/pagination-options";
export declare class BranchesRelationalRepository implements BranchRepository {
    private readonly branchRepository;
    constructor(branchRepository: Repository<BranchEntity>);
    reserveId(): Promise<Branch["id"]>;
    create(data: Omit<Branch, "id" | "createdAt" | "updatedAt" | "ulid" | "code">, manager?: EntityManager, id?: Branch["id"]): Promise<Branch>;
    findManyByCustomerId({ customerId, filterOptions, sortOptions, paginationOptions, }: {
        customerId: Branch["customerId"];
        filterOptions?: FilterBranchDto | null;
        sortOptions?: SortBranchDto[] | null;
        paginationOptions: IPaginationOptions;
    }): Promise<Branch[]>;
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
    findById(id: Branch["id"], manager?: EntityManager): Promise<NullableType<Branch>>;
    findHeadOfficeByCustomerId(customerId: Branch["customerId"]): Promise<NullableType<Branch>>;
    countByCustomerId(customerId: Branch["customerId"], filterOptions?: FilterBranchDto | null): Promise<number>;
    update(id: Branch["id"], payload: Partial<Branch>, manager?: EntityManager): Promise<Branch | null>;
    remove(id: Branch["id"], manager?: EntityManager): Promise<void>;
}
