import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesToUserEmailconfirmationPassrecovery1730916147356 implements MigrationInterface {
    name = 'AddIndexesToUserEmailconfirmationPassrecovery1730916147356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_user_confirmation_code" ON "email_confirmation" ("confirmation_code") `);
        await queryRunner.query(`CREATE INDEX "idx_user_recovery_code" ON "password_recovery" ("recovery_code") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_user_login" ON "user" ("login") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_user_email" ON "user" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_user_email"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_login"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_recovery_code"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_confirmation_code"`);
    }

}
