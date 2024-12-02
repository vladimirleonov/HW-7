import { MigrationInterface, QueryRunner } from "typeorm";

export class FixManyToOneInAnswerForQuestionFieldAndAddStatusAsEnumForAnswer1732737059385 implements MigrationInterface {
    name = 'FixManyToOneInAnswerForQuestionFieldAndAddStatusAsEnumForAnswer1732737059385'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "REL_c3d19a89541e4f0813f2fe0919"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."answer_status_enum" AS ENUM('Correct', 'Incorrect')`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "status" "public"."answer_status_enum" NOT NULL DEFAULT 'Incorrect'`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."answer_status_enum"`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "status" character varying`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "REL_c3d19a89541e4f0813f2fe0919" UNIQUE ("question_id")`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
