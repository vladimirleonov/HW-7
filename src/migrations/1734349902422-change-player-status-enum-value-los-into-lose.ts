import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePlayerStatusEnumValueLosIntoLose1734349902422
  implements MigrationInterface
{
  name = 'ChangePlayerStatusEnumValueLosIntoLose1734349902422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."player_status_enum" RENAME TO "player_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."player_status_enum" AS ENUM('Win', 'Lose', 'InProgress', 'Draw')`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "status" TYPE "public"."player_status_enum" USING "status"::"text"::"public"."player_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "status" SET DEFAULT 'InProgress'`,
    );
    await queryRunner.query(`DROP TYPE "public"."player_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."player_status_enum_old" AS ENUM('Win', 'Los', 'InProgress', 'Draw')`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "status" TYPE "public"."player_status_enum_old" USING "status"::"text"::"public"."player_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ALTER COLUMN "status" SET DEFAULT 'InProgress'`,
    );
    await queryRunner.query(`DROP TYPE "public"."player_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."player_status_enum_old" RENAME TO "player_status_enum"`,
    );
  }
}
