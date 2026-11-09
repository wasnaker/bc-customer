export declare class CreateBranchDto {
    name: string;
    isHeadOffice?: boolean;
    addressLine: string;
    provinceId: number;
    cityId: number;
    postalCode?: string | null;
    vatNumber?: string | null;
    vatType?: 'npwp' | 'nitku';
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    isActive?: boolean;
}
