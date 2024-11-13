import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAnswerEntity1731498251666 implements MigrationInterface {
  name = 'ChangeAnswerEntity1731498251666';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "question" ADD "published" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "question" DROP COLUMN "correct_answers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question" ADD "correct_answers" text array NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "question" DROP COLUMN "correct_answers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question" ADD "correct_answers" text NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "published"`);
  }
}
