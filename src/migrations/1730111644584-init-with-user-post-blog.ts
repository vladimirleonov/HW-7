import { MigrationInterface, QueryRunner } from "typeorm";

export class InitWithUserPostBlog1730111644584 implements MigrationInterface {
    name = 'InitWithUserPostBlog1730111644584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP CONSTRAINT "FK_857e9c1f08bc0a9f50101621833"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP CONSTRAINT "FK_d150be562deac1f539cc4b59fc4"`);
        await queryRunner.query(`ALTER TABLE "device" DROP CONSTRAINT "FK_ae7154510495c7ddda951b07a07"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_8770b84ec0b63d5c726a0681df4"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "created_at" TO "createdAt"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP CONSTRAINT "PK_857e9c1f08bc0a9f50101621833"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP COLUMN "confirmation_code"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP COLUMN "expiration_date"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP COLUMN "is_confirmed"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP CONSTRAINT "PK_d150be562deac1f539cc4b59fc4"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP COLUMN "recovery_code"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP COLUMN "expiration_date"`);
        await queryRunner.query(`ALTER TABLE "device" DROP CONSTRAINT "PK_17d554d4f6b44ff0e200ee4b920"`);
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "device_id"`);
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "device_name"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "short_description"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "likes_count"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "dislikes_count"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "blog_id"`);
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "website_url"`);
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "is_membership"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD "userId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD CONSTRAINT "PK_28d3d3fbd7503f3428b94fd18cc" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD "confirmationCode" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD "expirationDate" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD "isConfirmed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD "userId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD CONSTRAINT "PK_f5b57d414cf38032bbbe9ec578d" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD "recoveryCode" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD "expirationDate" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "device" ADD "deviceId" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "device" ADD CONSTRAINT "PK_6fe2df6e1c34fc6c18c786ca26e" PRIMARY KEY ("deviceId")`);
        await queryRunner.query(`ALTER TABLE "device" ADD "userId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "device" ADD "deviceName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ADD "shortDescription" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ADD "blogId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "post" ADD "likesCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "post" ADD "dislikesCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "blog" ADD "websiteUrl" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "blog" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "blog" ADD "isMembership" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD CONSTRAINT "FK_f5b57d414cf38032bbbe9ec578d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "device" ADD CONSTRAINT "FK_9eb58b0b777dbc2864820228ebc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9"`);
        await queryRunner.query(`ALTER TABLE "device" DROP CONSTRAINT "FK_9eb58b0b777dbc2864820228ebc"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP CONSTRAINT "FK_f5b57d414cf38032bbbe9ec578d"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc"`);
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "isMembership"`);
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "websiteUrl"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "dislikesCount"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "likesCount"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "blogId"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "shortDescription"`);
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "deviceName"`);
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "device" DROP CONSTRAINT "PK_6fe2df6e1c34fc6c18c786ca26e"`);
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "deviceId"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP COLUMN "expirationDate"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP COLUMN "recoveryCode"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP CONSTRAINT "PK_f5b57d414cf38032bbbe9ec578d"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP COLUMN "isConfirmed"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP COLUMN "expirationDate"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP COLUMN "confirmationCode"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP CONSTRAINT "PK_28d3d3fbd7503f3428b94fd18cc"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "blog" ADD "is_membership" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "blog" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "blog" ADD "website_url" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ADD "blog_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ADD "dislikes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "post" ADD "likes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "post" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "post" ADD "short_description" character varying(100) COLLATE "C" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "device" ADD "device_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "device" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "device" ADD "device_id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "device" ADD CONSTRAINT "PK_17d554d4f6b44ff0e200ee4b920" PRIMARY KEY ("device_id")`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD "expiration_date" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD "recovery_code" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD CONSTRAINT "PK_d150be562deac1f539cc4b59fc4" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD "is_confirmed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD "expiration_date" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD "confirmation_code" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD CONSTRAINT "PK_857e9c1f08bc0a9f50101621833" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at"`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_8770b84ec0b63d5c726a0681df4" FOREIGN KEY ("blog_id") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "device" ADD CONSTRAINT "FK_ae7154510495c7ddda951b07a07" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD CONSTRAINT "FK_d150be562deac1f539cc4b59fc4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD CONSTRAINT "FK_857e9c1f08bc0a9f50101621833" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
