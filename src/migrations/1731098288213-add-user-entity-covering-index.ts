import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEntityCoveringIndex1731098288213
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_device_covering ON "device" ("user_id") INCLUDE ("ip", "device_name", "iat", "device_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_device_covering
    `);
  }
}
