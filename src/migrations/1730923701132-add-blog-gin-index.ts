import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogGinIndex1730923701132 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the pg_trgm extension if it does not exist already
    await queryRunner.query(`
          CREATE EXTENSION IF NOT EXISTS pg_trgm;
        `);

    // Create a GIN index for the "name" column using the "gin_trgm_ops" operator class
    await queryRunner.query(`
      CREATE INDEX idx_blog_name_trgm ON "blog" USING GIN (name gin_trgm_ops);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the GIN index for the "name" column if it exists
    await queryRunner.query(`DROP INDEX IF EXISTS idx_blog_name_trgm;`);
  }
}
