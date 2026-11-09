/** Address block shared by customers (head office), branches and staff. */
export declare class HeadOfficeDto {
    name: string;
    addressLine: string;
    provinceId: number;
    cityId: number;
    postalCode?: string | null;
    vatNumber?: string | null;
    vatType?: 'npwp' | 'nitku';
}
export declare class CreateCustomerDto {
    name: string;
    userId?: number | null;
    npwpNumber?: string | null;
    nibNumber?: string | null;
    /**
     * Creating a customer ALWAYS creates its head-office branch simultaneously
     * (contract J1) — this block is the HO branch payload.
     */
    headOffice: HeadOfficeDto;
    isActive?: boolean;
}
