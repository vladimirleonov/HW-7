import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEnumTypeInPlayerEntity1731756137724
  implements MigrationInterface
{
  name = 'FixEnumTypeInPlayerEntity1731756137724';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."player_status_enum" AS ENUM('Win', 'Los', 'InProgress')`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD "status" "public"."player_status_enum" NOT NULL DEFAULT 'InProgress'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."player_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "player" ADD "status" character varying NOT NULL DEFAULT 'InProgress'`,
    );
  }
}
