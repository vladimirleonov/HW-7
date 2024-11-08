import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentEntityCoveringIndex1731096030783
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    /*
          postId, createdAt used in where and orderBy (composite index);
          covering index values content, commentatorId, createdAt
        */

    await queryRunner.query(`
      CREATE INDEX idx_comment_covering ON "comment" ("post_id", "created_at") INCLUDE ("id", "content", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_comment_covering
    `);
  }
}
