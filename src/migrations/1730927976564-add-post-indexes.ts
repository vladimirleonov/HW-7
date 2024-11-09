import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostIndexes1730927976564 implements MigrationInterface {
  name = 'AddPostIndexes1730927976564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "idx_title" ON "post" ("title") `);
    await queryRunner.query(
      `CREATE INDEX "idx_post_created_at" ON "post" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_10f6b0d21846ce3917795aac08" ON "post" ("id", "blog_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_10f6b0d21846ce3917795aac08"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_post_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_title"`);
  }
}
