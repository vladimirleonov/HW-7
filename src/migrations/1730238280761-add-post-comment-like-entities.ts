import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostCommentLikeEntities1730238280761 implements MigrationInterface {
    name = 'AddPostCommentLikeEntities1730238280761'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."comment_like_status_enum" AS ENUM('Like', 'Dislike', 'None')`);
        await queryRunner.query(`CREATE TABLE "comment_like" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."comment_like_status_enum" NOT NULL, "comment_id" integer NOT NULL, CONSTRAINT "PK_04f93e6f1ace5dbc1d8c562ccbf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."post_like_status_enum" AS ENUM('Like', 'Dislike', 'None')`);
        await queryRunner.query(`CREATE TABLE "post_like" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."post_like_status_enum" NOT NULL, "post_id" integer NOT NULL, CONSTRAINT "PK_0e95caa8a8b56d7797569cf5dc6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_a41125353b8530ffc2e28ccbd74"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "commentator_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_a41125353b8530ffc2e28ccbd74" FOREIGN KEY ("commentator_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_like" ADD CONSTRAINT "FK_4a0c128374ff87d4641cab920f0" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD CONSTRAINT "FK_a7ec6ac3dc7a05a9648c418f1ad" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_like" DROP CONSTRAINT "FK_a7ec6ac3dc7a05a9648c418f1ad"`);
        await queryRunner.query(`ALTER TABLE "comment_like" DROP CONSTRAINT "FK_4a0c128374ff87d4641cab920f0"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_a41125353b8530ffc2e28ccbd74"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "commentator_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_a41125353b8530ffc2e28ccbd74" FOREIGN KEY ("commentator_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "post_like"`);
        await queryRunner.query(`DROP TYPE "public"."post_like_status_enum"`);
        await queryRunner.query(`DROP TABLE "comment_like"`);
        await queryRunner.query(`DROP TYPE "public"."comment_like_status_enum"`);
    }

}
