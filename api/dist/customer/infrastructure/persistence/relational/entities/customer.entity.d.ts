import { InsertEvent } from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { BranchEntity } from './branch.entity';
export declare class CustomerEntity extends EntityRelationalHelper {
    id: bigint;
    /** 26-char ULID, generated in beforeInsert. */
    ulid: string | null;
    /** 6-char Crockford Base32 code derived from id, generated in beforeInsert. */
    code: string | null;
    name: string;
    /** Host user id (int PK) — main account owner. Nullable. */
    userId: number | null;
    npwpNumber: string | null;
    nibNumber: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    branches?: BranchEntity[];
    /**
     * ULID is assigned before insert (no dependency on the DB-generated id).
     * `code` derives from the auto-increment id, which only exists after the
     * row is written, so it is assigned in @AfterInsert.
     */
    assignUlid(): void;
    assignCode(event: InsertEvent<CustomerEntity>): Promise<void>;
}
