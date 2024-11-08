import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommentIndexesAddIndexToCommentLikeAndUserWhichUsedInComment1731097114584 implements MigrationInterface {
    name = 'CreateCommentIndexesAddIndexToCommentLikeAndUserWhichUsedInComment1731097114584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "post_id" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_user_id_login" ON "user" ("id", "login") `);
        await queryRunner.query(`CREATE INDEX "idx_post_id" ON "comment" ("post_id") `);
        await queryRunner.query(`CREATE INDEX "idx_commentator_id" ON "comment" ("commentator_id") `);
        await queryRunner.query(`CREATE INDEX "idx_comment_created_at" ON "comment" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_ce2986d9d703fd37bd359e0fdf" ON "comment_like" ("comment_id", "author_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_77d6c379ebdcd720580aa2c4f9" ON "comment_like" ("comment_id", "status") `);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_77d6c379ebdcd720580aa2c4f9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce2986d9d703fd37bd359e0fdf"`);
        await queryRunner.query(`DROP INDEX "public"."idx_comment_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_commentator_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_post_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_id_login"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "post_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_8aa21186314ce53c5b61a0e8c93" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
