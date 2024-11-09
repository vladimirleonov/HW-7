import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteUserEntityUnclusteredIndexes1731143853636
  implements MigrationInterface
{
  name = 'DeleteUserEntityUnclusteredIndexes1731143853636';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_user_login"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_email"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_email" ON "user" ("email") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_login" ON "user" ("login") `,
    );
  }
}
