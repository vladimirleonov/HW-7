import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsTypeormRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {} //@InjectModel(Post.name) private postModel: Model<Post>

  async findById(id: number): Promise<any> {
    const query = `
      SELECT * FROM posts
      WHERE id = $1
    `;

    const result = await this.dataSource.query(query, [id]);

    return result.length > 0 ? result[0] : null;
  }

  async findByPostIdAndBlogId(postId: number, blogId: number) {
    const query = `
      SELECT * FROM posts
      WHERE id = $1 AND blog_id = $2
    `;

    const result = await this.dataSource.query(query, [postId, blogId]);

    return result.length > 0 ? result[0] : null;
  }

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

  async update(
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
    postId: number,
  ): Promise<boolean> {
    const query: string = `
      UPDATE posts
      SET title=$1, short_description=$2, content=$3
      WHERE id=$4 AND blog_id=$5
    `;

    const result = await this.dataSource.query(query, [
      title,
      shortDescription,
      content,
      postId,
      blogId,
    ]);

    const updatedRowsCount: number = result[1];

    return updatedRowsCount === 1;
  }

  async increaseLikesCount(id: number) {
    const query: string = `
      UPDATE posts
      SET likes_count = likes_count + 1
      WHERE id = $1
    `;

    const result = this.dataSource.query(query, [id]);

    const updatedRowsCount: number = result[1];

    return updatedRowsCount === 1;
  }

  async decreaseLikesCount(id: number) {
    const query: string = `
      UPDATE posts
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = $1
    `;

    const result = this.dataSource.query(query, [id]);

    const updatedRowsCount: number = result[1];

    return updatedRowsCount === 1;
  }

  async increaseDislikesCount(id: number) {
    const query: string = `
      UPDATE posts
      SET dislikes_count = dislikes_count + 1
      WHERE id = $1
    `;

    const result = this.dataSource.query(query, [id]);

    const updatedRowsCount: number = result[1];

    return updatedRowsCount === 1;
  }

  async decreaseDislikesCount(id: number) {
    const query: string = `
      UPDATE posts
      SET dislikes_count = GREATEST(dislikes_count - 1, 0)
      WHERE id = $1
    `;

    const result = this.dataSource.query(query, [id]);

    const updatedRowsCount: number = result[1];

    return updatedRowsCount === 1;
  }

  async delete(blogId: number, postId: number): Promise<boolean> {
    const query: string = `
      DELETE FROM posts
      WHERE id=$1 AND blog_id=$2
    `;

    const result = await this.dataSource.query(query, [postId, blogId]);

    const deletedRowsCount: number = result[1];

    return deletedRowsCount === 1;
  }
}
