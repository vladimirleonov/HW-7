import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompositeIndexOnPasswordRecovery1731146827567
  implements MigrationInterface
{
  name = 'AddCompositeIndexOnPasswordRecovery1731146827567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_user_recovery_code"`);
    await queryRunner.query(
      `CREATE INDEX "idx_recovery_code_expiration_data" ON "password_recovery" ("recovery_code", "expiration_date") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_recovery_code_expiration_data"`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_recovery_code" ON "password_recovery" ("recovery_code") `,
    );
  }
}
