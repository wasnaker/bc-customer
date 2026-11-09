/**
 * Partial update of a customer. The head-office branch is NOT updated here —
 * it has its own endpoints (`PATCH /customer/branches/:id`).
 */
export declare class UpdateCustomerDto {
    name?: string;
    userId?: number | null;
    npwpNumber?: string | null;
    nibNumber?: string | null;
    isActive?: boolean;
}
