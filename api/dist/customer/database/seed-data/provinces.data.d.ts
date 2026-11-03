/** 38 provinsi Indonesia — sumber: fityannugroho/idn-area-data (Kemendagri). */
export interface ProvinceSeedRow {
    /** Id eksplisit agar deterministik di semua environment */
    id: number;
    isoCode: string;
    name: string;
}
export declare const PROVINCE_SEED: ProvinceSeedRow[];
