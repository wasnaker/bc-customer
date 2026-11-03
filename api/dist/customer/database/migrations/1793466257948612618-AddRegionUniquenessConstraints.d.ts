import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddCustomerUniquenessConstraints1793466257948612618 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
