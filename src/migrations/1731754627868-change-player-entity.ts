import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePlayerEntity1731754627868 implements MigrationInterface {
  name = 'ChangePlayerEntity1731754627868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player" DROP CONSTRAINT "FK_433f544c592c2b6cbdfd2edbec3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" DROP CONSTRAINT "REL_433f544c592c2b6cbdfd2edbec"`,
    );
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "game_id"`);
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "score" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "status" SET DEFAULT 'InProgress'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "score" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD "game_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "REL_433f544c592c2b6cbdfd2edbec" UNIQUE ("game_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_433f544c592c2b6cbdfd2edbec3" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
