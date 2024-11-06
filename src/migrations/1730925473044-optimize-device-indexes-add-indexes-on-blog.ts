import { MigrationInterface, QueryRunner } from "typeorm";

export class OptimizeDeviceIndexesAddIndexesOnBlog1730925473044 implements MigrationInterface {
    name = 'OptimizeDeviceIndexesAddIndexesOnBlog1730925473044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_device_name"`);
        await queryRunner.query(`DROP INDEX "public"."idx_iat"`);
        await queryRunner.query(`CREATE INDEX "idx_created_at" ON "blog" ("created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_created_at"`);
        await queryRunner.query(`CREATE INDEX "idx_iat" ON "device" ("iat") `);
        await queryRunner.query(`CREATE INDEX "idx_device_name" ON "device" ("device_name") `);
    }

}
