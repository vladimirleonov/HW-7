import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../../../base/types/like-status';

export class CommentLikesPostgresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findById(commentId: number, userId: number) {
    const query: string = `
      SELECT * FROM comment_likes
      WHERE comment_id = $1 AND author_id = $2
    `;

    const result = await this.dataSource.query(query, [commentId, userId]);

    return result.length > 0 ? result[0] : null;
  }

  async create(commentId: number, userId: number, likeStatus: LikeStatus) {
    const query: string = `
      INSERT INTO comment_likes (comment_id, author_id, status)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;

    const result = await this.dataSource.query(query, [
      commentId,
      userId,
      likeStatus,
    ]);

    const createdId: number = result[0].id;

    return createdId;
  }

  async update(commentId: number, userId: number, likeStatus: LikeStatus) {
    const query: string = `
      UPDATE comment_likes 
      SET status = $1, created_at = NOW()
      WHERE comment_id = $2 AND author_id = $3
    `;

    const result = await this.dataSource.query(query, [
      likeStatus,
      commentId,
      userId,
    ]);

    const updatedRowsCount = result[1];

    return updatedRowsCount === 1;
  }

  async delete(commentId: number, userId: number) {
    const query: string = `
      DELETE FROM comment_likes
      WHERE comment_id = $1 AND author_id = $2
    `;

    const result = await this.dataSource.query(query, [commentId, userId]);

    const deletedRowsCount = result[1];

    return deletedRowsCount === 1;
  }
}
