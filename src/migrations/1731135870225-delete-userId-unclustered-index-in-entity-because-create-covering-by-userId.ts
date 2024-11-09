import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteUserIdUnclusteredIndexInEntityBecauseCreateCoveringByUserId1731135870225
  implements MigrationInterface
{
  name =
    'DeleteUserIdUnclusteredIndexInEntityBecauseCreateCoveringByUserId1731135870225';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_user_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_user_id" ON "device" ("user_id") `,
    );
  }
}
