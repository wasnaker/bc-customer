import { Branch } from "../../../../domain/branch";
import { BranchEntity } from "../entities/branch.entity";
export declare class BranchMapper {
    static toDomain(raw: BranchEntity): Branch;
    static toPersistence(domainEntity: Partial<Branch>): BranchEntity;
}
