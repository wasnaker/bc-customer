import { Branch } from './branch';
export declare class Customer {
    id: bigint | string;
    ulid: string | null;
    code: string | null;
    name: string;
    userId: number | null;
    npwpNumber: string | null;
    nibNumber: string | null;
    isActive: boolean;
    /** Populated when the head office is requested alongside the customer. */
    headOffice?: Branch;
    createdAt: Date;
    updatedAt: Date;
}
