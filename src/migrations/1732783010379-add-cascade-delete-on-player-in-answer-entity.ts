import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteOnPlayerInAnswerEntity1732783010379
  implements MigrationInterface
{
  name = 'AddCascadeDeleteOnPlayerInAnswerEntity1732783010379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "answer" DROP CONSTRAINT "FK_d0606a27b8946f66e26b29857bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer" ADD CONSTRAINT "FK_d0606a27b8946f66e26b29857bc" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "answer" DROP CONSTRAINT "FK_d0606a27b8946f66e26b29857bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer" ADD CONSTRAINT "FK_d0606a27b8946f66e26b29857bc" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
