import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsPostgresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // async save(comments: CommentDocument): Promise<CommentDocument> {
  //   return comments.save();
  // }

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

  // async findById(id: string): Promise<any> {
  //   return this.commentModel.findById(id);
  // }
  //
  // async update(id: string, content): Promise<boolean> {
  //   const updatedInfo = await this.commentModel.updateOne(
  //     { _id: id },
  //     { $set: { content } },
  //   );
  //   return updatedInfo.matchedCount === 1;
  // }
  //
  // async deleteOne(id: string): Promise<boolean> {
  //   const deletedIndo = await this.commentModel.deleteOne({
  //     _id: id,
  //   });
  //   return deletedIndo.deletedCount === 1;
  // }
}
