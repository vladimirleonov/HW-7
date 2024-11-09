import { MigrationInterface, QueryRunner } from 'typeorm';

/*
  for ILIKE GIN index
*/

export class AddUserGinIndexes1730916998253 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the pg_trgm extension if it does not exist already
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `);

    // Create a GIN index for the "login" column using the "gin_trgm_ops" operator class
    await queryRunner.query(`
      CREATE INDEX idx_user_login_trgm ON "user" USING GIN (login gin_trgm_ops);
    `);

    // Create a GIN index for the "email" column using the "gin_trgm_ops" operator class
    await queryRunner.query(`
      CREATE INDEX idx_user_email_trgm ON "user" USING GIN (email gin_trgm_ops);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the GIN index for the "login" column if it exists
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_login_trgm;`);

    // Drop the GIN index for the "email" column if it exists
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_email_trgm;`);
  }
}
