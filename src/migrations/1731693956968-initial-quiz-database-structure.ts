import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialQuizDatabaseStructure1731693956968
  implements MigrationInterface
{
  name = 'InitialQuizDatabaseStructure1731693956968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "answer" ("id" SERIAL NOT NULL, "player_id" integer NOT NULL, "question_id" integer NOT NULL, "status" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_c3d19a89541e4f0813f2fe0919" UNIQUE ("question_id"), CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "game" ("id" SERIAL NOT NULL, "status" character varying NOT NULL DEFAULT 'Pending', "pair_created_date" TIMESTAMP WITH TIME ZONE, "start_game_date" TIMESTAMP WITH TIME ZONE, "finish_game_date" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "player" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "game_id" integer NOT NULL, "score" integer NOT NULL, "status" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_433f544c592c2b6cbdfd2edbec" UNIQUE ("game_id"), CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "game_questions" ("game_id" integer NOT NULL, "question_id" integer NOT NULL, CONSTRAINT "PK_7755e7207f95809211fab8f84d2" PRIMARY KEY ("game_id", "question_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer" ADD CONSTRAINT "FK_d0606a27b8946f66e26b29857bc" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer" ADD CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_d04e64fc9b7fd372000c0dfda3f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_433f544c592c2b6cbdfd2edbec3" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_questions" ADD CONSTRAINT "FK_4c5351759926b365b1572dbdd1e" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_questions" ADD CONSTRAINT "FK_8b122e0afbb8b1a90a9b8c8ab56" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_questions" DROP CONSTRAINT "FK_8b122e0afbb8b1a90a9b8c8ab56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_questions" DROP CONSTRAINT "FK_4c5351759926b365b1572dbdd1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" DROP CONSTRAINT "FK_433f544c592c2b6cbdfd2edbec3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" DROP CONSTRAINT "FK_d04e64fc9b7fd372000c0dfda3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer" DROP CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer" DROP CONSTRAINT "FK_d0606a27b8946f66e26b29857bc"`,
    );
    await queryRunner.query(`DROP TABLE "game_questions"`);
    await queryRunner.query(`DROP TABLE "player"`);
    await queryRunner.query(`DROP TABLE "game"`);
    await queryRunner.query(`DROP TABLE "answer"`);
  }
}
