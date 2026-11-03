export declare class CreateBranchDto {
    name: string;
    isHeadOffice?: boolean;
    addressLine: string;
    provinceId: number;
    cityId: number;
    postalCode?: string | null;
    nitkuNumber?: string | null;
    vatType?: 'npwp' | 'nitku';
    isActive?: boolean;
}
