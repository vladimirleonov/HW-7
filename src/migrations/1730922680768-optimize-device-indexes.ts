import { MigrationInterface, QueryRunner } from "typeorm";

export class OptimizeDeviceIndexes1730922680768 implements MigrationInterface {
    name = 'OptimizeDeviceIndexes1730922680768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_user_login_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_email_trgm"`);
        await queryRunner.query(`CREATE INDEX "idx_user_id" ON "device" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3680ad6d48f2e2de392d00f79a" ON "device" ("user_id", "device_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_699827741f01b3d1f4458b557e" ON "device" ("iat", "device_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_699827741f01b3d1f4458b557e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3680ad6d48f2e2de392d00f79a"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_id"`);
        await queryRunner.query(`CREATE INDEX "idx_user_email_trgm" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "idx_user_login_trgm" ON "user" ("login") `);
    }

}
