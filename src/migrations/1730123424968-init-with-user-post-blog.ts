import { MigrationInterface, QueryRunner } from "typeorm";

export class InitWithUserPostBlog1730123424968 implements MigrationInterface {
    name = 'InitWithUserPostBlog1730123424968'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_confirmation" ("user_id" integer NOT NULL, "confirmation_code" uuid NOT NULL, "expiration_date" TIMESTAMP WITH TIME ZONE NOT NULL, "is_confirmed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_857e9c1f08bc0a9f50101621833" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "password_recovery" ("user_id" integer NOT NULL, "recovery_code" uuid NOT NULL, "expiration_date" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_d150be562deac1f539cc4b59fc4" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "login" character varying(10) COLLATE "C" NOT NULL, "password" character varying(60) NOT NULL, "email" character varying COLLATE "C" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_142a4828a885209f210712ac4e" CHECK (length(login) >= 3), CONSTRAINT "CHK_d9e92cccf41f419948c80c1b5c" CHECK (length(password) >= 6), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "device" ("device_id" uuid NOT NULL, "user_id" integer NOT NULL, "device_name" character varying NOT NULL, "ip" character varying NOT NULL, "iat" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "exp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_17d554d4f6b44ff0e200ee4b920" PRIMARY KEY ("device_id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "title" character varying(30) COLLATE "C" NOT NULL, "short_description" character varying(100) COLLATE "C" NOT NULL, "content" character varying(1000) COLLATE "C" NOT NULL, "blog_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "likes_count" integer NOT NULL DEFAULT '0', "dislikes_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blog" ("id" SERIAL NOT NULL, "name" character varying(15) COLLATE "C" NOT NULL, "description" character varying(500) COLLATE "C" NOT NULL, "website_url" character varying(100) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_membership" boolean NOT NULL, CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD CONSTRAINT "FK_857e9c1f08bc0a9f50101621833" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD CONSTRAINT "FK_d150be562deac1f539cc4b59fc4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "device" ADD CONSTRAINT "FK_ae7154510495c7ddda951b07a07" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_8770b84ec0b63d5c726a0681df4" FOREIGN KEY ("blog_id") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_8770b84ec0b63d5c726a0681df4"`);
        await queryRunner.query(`ALTER TABLE "device" DROP CONSTRAINT "FK_ae7154510495c7ddda951b07a07"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP CONSTRAINT "FK_d150be562deac1f539cc4b59fc4"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP CONSTRAINT "FK_857e9c1f08bc0a9f50101621833"`);
        await queryRunner.query(`DROP TABLE "blog"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "device"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "password_recovery"`);
        await queryRunner.query(`DROP TABLE "email_confirmation"`);
    }

}
