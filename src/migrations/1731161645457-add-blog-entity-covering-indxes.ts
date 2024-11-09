import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogEntityCoveringIndxes1731161645457
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_blog_name_covering
      ON "blog" ("name")
      INCLUDE ("id", "description", "website_url", "created_at", "is_membership");
    `);

    await queryRunner.query(`
      CREATE INDEX idx_blog_created_at_covering
      ON "blog" ("created_at")
      INCLUDE ("id", "name", "description", "website_url", "is_membership");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_blog_name_covering');

    await queryRunner.query(
      'DROP INDEX IF EXISTS idx_blog_created_at_covering',
    );
  }
}
