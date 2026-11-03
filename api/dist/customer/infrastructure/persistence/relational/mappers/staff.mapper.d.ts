import { Staff } from '../../../../domain/staff';
import { StaffEntity } from '../entities/staff.entity';
export declare class StaffMapper {
    static toDomain(raw: StaffEntity): Staff;
    static toPersistence(domainEntity: Partial<Staff>): StaffEntity;
}
