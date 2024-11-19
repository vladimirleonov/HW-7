import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserCascadeDeleteInPlayerEntity1732022999284 implements MigrationInterface {
    name = 'AddUserCascadeDeleteInPlayerEntity1732022999284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_d04e64fc9b7fd372000c0dfda3f"`);
        await queryRunner.query(`ALTER TABLE "game" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_d04e64fc9b7fd372000c0dfda3f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_d04e64fc9b7fd372000c0dfda3f"`);
        await queryRunner.query(`ALTER TABLE "game" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_d04e64fc9b7fd372000c0dfda3f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
