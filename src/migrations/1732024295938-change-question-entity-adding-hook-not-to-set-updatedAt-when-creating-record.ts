import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeQuestionEntityAddingHookNotToSetUpdatedAtWhenCreatingRecord1732024295938 implements MigrationInterface {
    name = 'ChangeQuestionEntityAddingHookNotToSetUpdatedAtWhenCreatingRecord1732024295938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" ALTER COLUMN "updated_at" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" ALTER COLUMN "updated_at" SET NOT NULL`);
    }

}
