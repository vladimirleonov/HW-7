import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../../../base/types/like-status';

@Injectable()
export class PostLikesPostgresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findById(postId: number, userId: number) {
    const query = `
      SELECT * FROM post_likes
      WHERE post_id = $1 AND author_id = $2
    `;

    const result = await this.dataSource.query(query, [postId, userId]);

    return result.length > 0 ? result[0] : null;
  }

  async create(postId: number, userId: number, likeStatus: LikeStatus) {
    const query: string = `
      INSERT INTO post_likes (post_id, author_id, status)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;

    const result = await this.dataSource.query(query, [
      postId,
      userId,
      likeStatus,
    ]);

    console.log('create post_likes', result);

    return result.length > 0 ? result[0] : null;
  }

  async update(postId: number, userId: number, likeStatus: LikeStatus) {
    const query: string = `
      UPDATE post_likes 
      SET status = $1, created_at = NOW()
      WHERE post_id = $2 AND author_id = $3
    `;

    const result = await this.dataSource.query(query, [
      likeStatus,
      postId,
      userId,
    ]);

    console.log('update post_likes result', result);

    return result[1] === 1;
  }

  async delete(postId: number, userId: number) {
    const query: string = `
      DELETE FROM post_likes
      WHERE post_id = $1 AND author_id = $2
    `;

    const result = await this.dataSource.query(query, [postId, userId]);
    console.log('delete post_likes result', result);

    const deletedRowsCount: number = result[1];

    return deletedRowsCount === 1;
  }
}
