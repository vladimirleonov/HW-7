import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlayerCascadeDeleteInGameEntity1732023226335 implements MigrationInterface {
    name = 'AddPlayerCascadeDeleteInGameEntity1732023226335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_4b8c0b7cf035c27f6a470234a02"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_c853376060f9557f9a48d214dd5"`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_c853376060f9557f9a48d214dd5" FOREIGN KEY ("first_player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_4b8c0b7cf035c27f6a470234a02" FOREIGN KEY ("second_player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_4b8c0b7cf035c27f6a470234a02"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_c853376060f9557f9a48d214dd5"`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_c853376060f9557f9a48d214dd5" FOREIGN KEY ("first_player_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_4b8c0b7cf035c27f6a470234a02" FOREIGN KEY ("second_player_id") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
