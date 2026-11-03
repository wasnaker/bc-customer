/** 514 kabupaten/kota Indonesia — sumber: fityannugroho/idn-area-data (Kemendagri). */
export interface RegencySeedRow {
    /** Id eksplisit agar deterministik di semua environment */
    id: number;
    provinceIsoCode: string;
    /** Kode BPS 4 digit, mis. 11.01 */
    code: string;
    name: string;
    type: 'kabupaten' | 'kota';
}
export declare const REGENCY_SEED: RegencySeedRow[];
