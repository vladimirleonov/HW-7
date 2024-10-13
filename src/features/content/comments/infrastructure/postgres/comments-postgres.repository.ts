import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsPostgresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findById(id: number): Promise<any> {
    const query: string = `
      SELECT * FROM comments
      WHERE id = $1
    `;

    const result = await this.dataSource.query(query, [id]);

    return result.length > 0 ? result[0] : null;
  }

  async create(postId: number, content: string, userId: number) {
    const query = `
      INSERT INTO comments (post_id, content, commentator_id, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id;
    `;

    const result = await this.dataSource.query(query, [
      postId,
      content,
      userId,
    ]);

    const createdId: number = result[0].id;

    return createdId;
  }

  async update(id: number, content: string): Promise<boolean> {
    const query: string = `
      UPDATE comments 
      SET content = $1
      WHERE id = $2
    `;

    const result = await this.dataSource.query(query, [content, id]);

    const updatedRowsCount = result[1];

    return updatedRowsCount === 1;
  }

  async increaseLikesCount(id: number) {
    const query: string = `
      UPDATE comments
      SET likes_count = likes_count + 1
      WHERE id = $1
    `;

    const result = await this.dataSource.query(query, [id]);

    const updatedRowsCount = result[1];

    return updatedRowsCount === 1;
  }

  async decreaseLikesCount(id: number) {
    const query: string = `
      UPDATE comments
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = $1
    `;

    const result = await this.dataSource.query(query, [id]);

    const updatedRowsCount = result[1];

    return updatedRowsCount === 1;
  }

  async increaseDislikesCount(id: number) {
    const query: string = `
      UPDATE comments
      SET dislikes_count = dislikes_count + 1
      WHERE id = $1
    `;

    const result = await this.dataSource.query(query, [id]);

    const updatedRowsCount = result[1];

    return updatedRowsCount === 1;
  }

  async decreaseDislikesCount(id: number) {
    const query: string = `
      UPDATE comments
      SET dislikes_count = GREATEST(dislikes_count - 1, 0)
      WHERE id = $1
    `;

    const result = await this.dataSource.query(query, [id]);

    const updatedRowsCount = result[1];

    return updatedRowsCount === 1;
  }

  async delete(id: number): Promise<boolean> {
    const query: string = `
      DELETE FROM comments
      WHERE id=$1
    `;

    const result = await this.dataSource.query(query, [id]);

    const deletedRowsCount = result[1];

    return deletedRowsCount === 1;
  }
}
