import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeGameStatusFieldInGameEntity1732016911385
  implements MigrationInterface
{
  name = 'ChangeGameStatusFieldInGameEntity1732016911385';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the new enum type
    await queryRunner.query(
      `CREATE TYPE "public"."game_status_enum_new" AS ENUM('PendingSecondPlayer', 'Active', 'Finished')`,
    );

    // Add a temporary column with the new enum type
    await queryRunner.query(
      `ALTER TABLE "game" ADD COLUMN "status_temp" "public"."game_status_enum_new"`,
    );

    // Migrate existing data to the temporary column with explicit casting to the new enum type
    await queryRunner.query(
      `UPDATE "game" SET "status_temp" = CASE 
         WHEN "status" = 'Pending' THEN 'PendingSecondPlayer'::"public"."game_status_enum_new"
         WHEN "status" = 'Active' THEN 'Active'::"public"."game_status_enum_new"
         WHEN "status" = 'Finished' THEN 'Finished'::"public"."game_status_enum_new"
         ELSE NULL END`,
    );

    // Drop the old enum type constraint
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "status"`);

    // Rename the temporary column to replace the old one
    await queryRunner.query(
      `ALTER TABLE "game" RENAME COLUMN "status_temp" TO "status"`,
    );

    // Set the default value for the new enum
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "status" SET DEFAULT 'PendingSecondPlayer'`,
    );

    // Drop the old enum type
    await queryRunner.query(`DROP TYPE "public"."game_status_enum"`);

    // Rename the new enum type to the original name
    await queryRunner.query(
      `ALTER TYPE "public"."game_status_enum_new" RENAME TO "game_status_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Create the old enum type
    await queryRunner.query(
      `CREATE TYPE "public"."game_status_enum_old" AS ENUM('Pending', 'Active', 'Finished')`,
    );

    // Add a temporary column with the old enum type
    await queryRunner.query(
      `ALTER TABLE "game" ADD COLUMN "status_temp" "public"."game_status_enum_old"`,
    );

    // Migrate data back to the temporary column with explicit casting to the old enum type
    await queryRunner.query(
      `UPDATE "game" SET "status_temp" = CASE 
         WHEN "status" = 'PendingSecondPlayer' THEN 'Pending'::"public"."game_status_enum_old"
         WHEN "status" = 'Active' THEN 'Active'::"public"."game_status_enum_old"
         WHEN "status" = 'Finished' THEN 'Finished'::"public"."game_status_enum_old"
         ELSE NULL END`,
    );

    // Drop the new enum type constraint
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "status"`);

    // Rename the temporary column to replace the old one
    await queryRunner.query(
      `ALTER TABLE "game" RENAME COLUMN "status_temp" TO "status"`,
    );

    // Set the default value for the old enum
    await queryRunner.query(
      `ALTER TABLE "game" ALTER COLUMN "status" SET DEFAULT 'Pending'`,
    );

    // Drop the new enum type
    await queryRunner.query(`DROP TYPE "public"."game_status_enum"`);

    // Rename the old enum type to the original name
    await queryRunner.query(
      `ALTER TYPE "public"."game_status_enum_old" RENAME TO "game_status_enum"`,
    );
  }
}
