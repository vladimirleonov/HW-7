import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePostIndexes1731170470305 implements MigrationInterface {
  name = 'ChangePostIndexes1731170470305';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_post_created_at"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_4b290632b213c13fa26afc394d" ON "post_like" ("post_id", "author_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a6774b32cb8f3eb4c08b95297" ON "post_like" ("post_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_blog_id" ON "post" ("blog_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_blog_id_created_at" ON "post" ("created_at", "blog_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_blog_id_title" ON "post" ("title", "blog_id") `,
    );
    await queryRunner.query(`DROP INDEX "idx_title"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_blog_id_title"`);
    await queryRunner.query(`DROP INDEX "public"."idx_blog_id_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_blog_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8a6774b32cb8f3eb4c08b95297"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4b290632b213c13fa26afc394d"`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_post_created_at" ON "post" ("created_at") `,
    );
    await queryRunner.query(`CREATE INDEX "idx_title" ON "post" ("title") `);
  }
}
