import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { BranchEntity } from './branch.entity';
export declare class StaffEntity extends EntityRelationalHelper {
    id: bigint;
    /** 26-char ULID, generated in beforeInsert. */
    ulid: string | null;
    /** Owning branch (bigint PK, intra-module). FK RESTRICT — tidak ikut terhapus. */
    branch: BranchEntity;
    branchId: bigint;
    name: string;
    /** Host user id (int PK) — nullable; unique across all staff when set. */
    userId: number | null;
    position: string | null;
    phone: string | null;
    email: string | null;
    /** NIP pegawai — nullable (I4). */
    nip: string | null;
    /** Alamat staff — nullable (I4). */
    addressLine: string | null;
    /** Host province id — nullable, untuk modul actor lain (I4). */
    provinceId: number | null;
    /** Host regency id — nullable, untuk modul actor lain (I4). */
    cityId: number | null;
    /** Host file id (uuid PK). Nullable profile photo. */
    photoId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    assignUlid(): void;
}
