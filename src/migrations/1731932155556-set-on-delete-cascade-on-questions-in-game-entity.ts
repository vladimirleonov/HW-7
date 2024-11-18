import { MigrationInterface, QueryRunner } from "typeorm";

export class SetOnDeleteCascadeOnQuestionsInGameEntity1731932155556 implements MigrationInterface {
    name = 'SetOnDeleteCascadeOnQuestionsInGameEntity1731932155556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_question" DROP CONSTRAINT "FK_8ebac45eba3f012caca95114b85"`);
        await queryRunner.query(`ALTER TABLE "game_question" DROP CONSTRAINT "FK_6139b30b8f4381e6d6e057a71d3"`);
        await queryRunner.query(`ALTER TABLE "game_question" ADD CONSTRAINT "FK_6139b30b8f4381e6d6e057a71d3" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_question" ADD CONSTRAINT "FK_8ebac45eba3f012caca95114b85" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_question" DROP CONSTRAINT "FK_8ebac45eba3f012caca95114b85"`);
        await queryRunner.query(`ALTER TABLE "game_question" DROP CONSTRAINT "FK_6139b30b8f4381e6d6e057a71d3"`);
        await queryRunner.query(`ALTER TABLE "game_question" ADD CONSTRAINT "FK_6139b30b8f4381e6d6e057a71d3" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_question" ADD CONSTRAINT "FK_8ebac45eba3f012caca95114b85" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
