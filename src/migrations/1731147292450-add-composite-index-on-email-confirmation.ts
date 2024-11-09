import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompositeIndexOnEmailConfirmation1731147292450
  implements MigrationInterface
{
  name = 'AddCompositeIndexOnEmailConfirmation1731147292450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_user_confirmation_code"`);
    await queryRunner.query(
      `CREATE INDEX "idx_confirmation_code_expiration_data" ON "email_confirmation" ("confirmation_code", "expiration_date") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_confirmation_code_expiration_data"`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_confirmation_code" ON "email_confirmation" ("confirmation_code") `,
    );
  }
}
