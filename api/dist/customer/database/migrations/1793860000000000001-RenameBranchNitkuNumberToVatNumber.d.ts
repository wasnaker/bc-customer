import { MigrationInterface, QueryRunner } from "typeorm";
/**
 * Rename branch.nitkuNumber -> vatNumber.
 *
 * Layer domain/DTO/web sudah dipakai field `vatNumber`; kolom DB masih
 * bernama `nitkuNumber`. Migration ini menyamakan nama kolom dengan layer
 * atasnya. Idempotent: aman dijalankan berulang (IF EXISTS).
 */
export declare class RenameBranchNitkuNumberToVatNumber1793860000001 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
