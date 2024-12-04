import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePKInGameQuestionEntityAddId1733239310624
  implements MigrationInterface
{
  name = 'ChangePKInGameQuestionEntityAddId1733239310624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "PK_8f014a706d8915bf4796be85367"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "PK_e438b9a0dba78af8fca184799d0" PRIMARY KEY ("game_id", "question_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "FK_6139b30b8f4381e6d6e057a71d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "FK_8ebac45eba3f012caca95114b85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "PK_e438b9a0dba78af8fca184799d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "PK_13c7cf70f31c4a4b5f6633ed7d5" PRIMARY KEY ("question_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "PK_13c7cf70f31c4a4b5f6633ed7d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "PK_08867ba249fa9d179d5449d27d3" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "FK_6139b30b8f4381e6d6e057a71d3" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "FK_8ebac45eba3f012caca95114b85" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "FK_8ebac45eba3f012caca95114b85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "FK_6139b30b8f4381e6d6e057a71d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "PK_08867ba249fa9d179d5449d27d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "PK_13c7cf70f31c4a4b5f6633ed7d5" PRIMARY KEY ("question_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "PK_13c7cf70f31c4a4b5f6633ed7d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "PK_e438b9a0dba78af8fca184799d0" PRIMARY KEY ("game_id", "question_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "FK_8ebac45eba3f012caca95114b85" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "FK_6139b30b8f4381e6d6e057a71d3" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" DROP CONSTRAINT "PK_e438b9a0dba78af8fca184799d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_question" ADD CONSTRAINT "PK_8f014a706d8915bf4796be85367" PRIMARY KEY ("game_id", "question_id")`,
    );
    await queryRunner.query(`ALTER TABLE "game_question" DROP COLUMN "id"`);
  }
}
