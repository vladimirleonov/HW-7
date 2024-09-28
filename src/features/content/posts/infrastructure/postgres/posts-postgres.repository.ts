import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsPostgresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {} //@InjectModel(Post.name) private postModel: Model<Post>

  // async save(post: PostDocument): Promise<PostDocument> {
  //   return post.save();
  // }

  async create(
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
  ): Promise<number> {
    const query: string = `
      INSERT INTO posts
      (title, short_description, content, blog_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    const result = await this.dataSource.query(query, [
      title,
      shortDescription,
      content,
      blogId,
    ]);

    const createdId: number = result[0].id;

    return createdId;
  }

  // async findById(id: string): Promise<PostDocument | null> {
  //   return this.postModel.findById(new Types.ObjectId(id));
  // }
  //
  // async delete(id: string): Promise<boolean> {
  //   const result = await this.postModel.deleteOne({ _id: id });
  //   return result.deletedCount === 1;
  // }
}
