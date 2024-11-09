import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCommentIndexes1731172658564 implements MigrationInterface {
  name = 'ChangeCommentIndexes1731172658564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_commentator_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_comment_covering"`);
    await queryRunner.query(`DROP INDEX "public"."idx_blog_name_covering"`);
    await queryRunner.query(`DROP INDEX "public"."idx_post_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_blog_name_covering" ON "blog" ("id", "name", "description", "website_url", "created_at", "is_membership") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_comment_covering" ON "comment" ("id", "content", "created_at", "post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_commentator_id" ON "comment" ("commentator_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_post_id" ON "comment" ("post_id") `,
    );
  }
}
