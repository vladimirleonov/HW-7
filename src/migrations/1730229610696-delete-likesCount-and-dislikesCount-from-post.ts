import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteLikesCountAndDislikesCountFromPost1730229610696 implements MigrationInterface {
    name = 'DeleteLikesCountAndDislikesCountFromPost1730229610696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "likes_count"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "dislikes_count"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "dislikes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "post" ADD "likes_count" integer NOT NULL DEFAULT '0'`);
    }

}
