import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthorToLikeEntity1730239548928 implements MigrationInterface {
    name = 'AddAuthorToLikeEntity1730239548928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment_like" ADD "author_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD "author_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_like" ADD CONSTRAINT "FK_47c42fd89b5b88cbaaca959525a" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD CONSTRAINT "FK_1f77a96ec5b1a35617c55ea06bd" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_like" DROP CONSTRAINT "FK_1f77a96ec5b1a35617c55ea06bd"`);
        await queryRunner.query(`ALTER TABLE "comment_like" DROP CONSTRAINT "FK_47c42fd89b5b88cbaaca959525a"`);
        await queryRunner.query(`ALTER TABLE "post_like" DROP COLUMN "author_id"`);
        await queryRunner.query(`ALTER TABLE "comment_like" DROP COLUMN "author_id"`);
    }

}
