import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEntityCoveringIndxes1731143981408
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX idx_user_created_at_covering ON "user" ("created_at") INCLUDE ("id", "login", "email")`,
    );

    await queryRunner.query(
      `CREATE INDEX idx_user_login_covering ON "user" ("login") INCLUDE ("id", "email", "created_at")`,
    );

    await queryRunner.query(
      `CREATE INDEX idx_user_email_covering ON "user" ("email") INCLUDE ("id", "login", "created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_user_created_at_covering;`,
    );

    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_login_covering;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_email_covering;`);
  }
}
