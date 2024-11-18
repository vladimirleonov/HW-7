import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJoinColumnInPlayerEntity1731760412686
  implements MigrationInterface
{
  name = 'AddJoinColumnInPlayerEntity1731760412686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game" ADD "first_player_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "UQ_c853376060f9557f9a48d214dd5" UNIQUE ("first_player_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD "second_player_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "UQ_4b8c0b7cf035c27f6a470234a02" UNIQUE ("second_player_id")`,
    );
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."game_status_enum" AS ENUM('Pending', 'Active', 'Finished')`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD "status" "public"."game_status_enum" NOT NULL DEFAULT 'Pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_c853376060f9557f9a48d214dd5" FOREIGN KEY ("first_player_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_4b8c0b7cf035c27f6a470234a02" FOREIGN KEY ("second_player_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_4b8c0b7cf035c27f6a470234a02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_c853376060f9557f9a48d214dd5"`,
    );
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."game_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "game" ADD "status" character varying NOT NULL DEFAULT 'Pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "UQ_4b8c0b7cf035c27f6a470234a02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP COLUMN "second_player_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "UQ_c853376060f9557f9a48d214dd5"`,
    );
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "first_player_id"`);
  }
}
