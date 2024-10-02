import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsPostgresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // async save(comments: CommentDocument): Promise<CommentDocument> {
  //   return comments.save();
  // }

  async findById(id: number): Promise<any> {
    const query: string = `
      SELECT * FROM comments
      WHERE id = $1
    `;

    const result = await this.dataSource.query(query, [id]);

    return result.length > 0 ? result[0] : null;
    //return this.commentModel.findById(id);
  }

  async create(postId: number, content: string, userId: number) {
    const query = `
      INSERT INTO comments (post_id, content, commentator_id)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;

    const result = await this.dataSource.query(query, [
      postId,
      content,
      userId,
    ]);

    return result[0].id;
  }

  async update(id: number, content: string): Promise<boolean> {
    const query: string = `
      UPDATE comments 
      SET content = $1
      WHERE id = $2
    `;

    const result = await this.dataSource.query(query, [content, id]);

    return result[1] === 1;
  }

  async delete(id: number): Promise<boolean> {
    const query: string = `
      DELETE FROM comments
      WHERE id=$1
    `;

    const result = await this.dataSource.query(query, [id]);

    return result.length > 0 ? result[0] : null;

    // const deletedIndo = await this.commentModel.deleteOne({
    //   _id: id,
    // });
    // return deletedIndo.deletedCount === 1;
  }
}
