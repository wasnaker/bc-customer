import { InsertEvent } from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CustomerEntity } from './customer.entity';
import { StaffEntity } from './staff.entity';
export declare class BranchEntity extends EntityRelationalHelper {
    id: bigint;
    /** 26-char ULID, generated in beforeInsert. */
    ulid: string | null;
    /** 6-char Crockford Base32 code derived from id, generated in afterInsert. */
    code: string | null;
    /** Owning customer (bigint PK, intra-module). Cascade delete via FK. */
    customer: CustomerEntity;
    customerId: bigint;
    name: string;
    isHeadOffice: boolean;
    /**
     * Alamat lengkap cabang. Wajib untuk SEMUA branch (J2):
     * cabang bisa beda kota beda provinsi, jadi alamat tidak boleh kosong.
     */
    addressLine: string;
    /** Host province id (int PK, owned by the region module). FK RESTRICT. */
    provinceId: number;
    /** Host regency id (int PK, owned by the region module). FK RESTRICT. */
    cityId: number;
    postalCode: string | null;
    nitkuNumber: string | null;
    /** VAT basis for invoices: 'npwp' (default) or 'nitku'. */
    vatType: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    staff?: StaffEntity[];
    assignUlid(): void;
    assignCode(event: InsertEvent<BranchEntity>): Promise<void>;
}
