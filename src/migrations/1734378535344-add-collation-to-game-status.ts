import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCollationToGameStatus1734378535344 implements MigrationInterface {
    name = 'AddCollationToGameStatus1734378535344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_user_login_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_email_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_created_at_covering"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_login_covering"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_email_covering"`);
        await queryRunner.query(`DROP INDEX "public"."idx_device_covering"`);
        await queryRunner.query(`DROP INDEX "public"."idx_blog_name_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_blog_created_at_covering"`);
        await queryRunner.query(`CREATE INDEX "idx_post_id_created_at" ON "comment" ("post_id", "created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_post_id_created_at"`);
        await queryRunner.query(`CREATE INDEX "idx_blog_created_at_covering" ON "blog" ("id", "name", "description", "website_url", "created_at", "is_membership") `);
        await queryRunner.query(`CREATE INDEX "idx_blog_name_trgm" ON "blog" ("name") `);
        await queryRunner.query(`CREATE INDEX "idx_device_covering" ON "device" ("device_id", "user_id", "device_name", "ip", "iat") `);
        await queryRunner.query(`CREATE INDEX "idx_user_email_covering" ON "user" ("id", "login", "email", "created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_user_login_covering" ON "user" ("id", "login", "email", "created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_user_created_at_covering" ON "user" ("id", "login", "email", "created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_user_email_trgm" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "idx_user_login_trgm" ON "user" ("login") `);
    }

}
