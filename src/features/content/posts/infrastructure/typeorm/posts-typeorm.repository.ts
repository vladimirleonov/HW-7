import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Post } from '../../domain/post.entity';
import { Blog } from '../../../blogs/domain/blog.entity';

@Injectable()
export class PostsTypeormRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
  ) {}

  async findById(id: number): Promise<any> {
    // Post | null
    return await this.postsRepository.findOneBy({
      id,
    });

    // const query = `
    //   SELECT * FROM posts
    //   WHERE id = $1
    // `;
    //
    // const result = await this.dataSource.query(query, [id]);
    //
    // return result.length > 0 ? result[0] : null;
  }

  // +
  async findByPostIdAndBlogId(postId: number, blogId: number) {
    // Post | null
    return await this.postsRepository.findOneBy({
      id: postId,
      blogId: blogId,
    });

    // const query = `
    //   SELECT * FROM posts
    //   WHERE id = $1 AND blog_id = $2
    // `;
    //
    // const result = await this.dataSource.query(query, [postId, blogId]);
    //
    // return result.length > 0 ? result[0] : null;
  }

  // +
  async create(
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
  ): Promise<number> {
    // const result: Blog | null = await this.blogsRepository
    //   .createQueryBuilder('b')
    //   .select('b.name')
    //   .getOne();
    // console.log(blogName);

    const createdPost: Post = await this.postsRepository.save({
      title: title,
      shortDescription: shortDescription,
      content: content,
      blogId: blogId,
      // createdAt: new Date(),
    });

    const postId: number = createdPost.id;
    // console.log(postId);
    return postId;

    // console.log('createdPost', createdPost);
    // createdPost Post {
    //   title: '111111111112qqqq',
    //     shortDescription: 'shortDescription1233123',
    //     content: 'content132123',
    //     blog: Blog { id: 5 },
    //   id: 5,
    //     createdAt: 2024-10-23T18:56:22.445Z,
    //     likesCount: 0,
    //     dislikesCount: 0
    // }
    //
    // const query: string = `
    //   INSERT INTO posts
    //   (title, short_description, content, blog_id)
    //   VALUES ($1, $2, $3, $4)
    //   RETURNING id;
    // `;
    //
    // const result = await this.dataSource.query(query, [
    //   title,
    //   shortDescription,
    //   content,
    //   blogId,
    // ]);
    //
    // const createdId: number = result[0].id;
    //
    // return createdId;
  }

  // +
  async update(
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
    postId: number,
  ): Promise<boolean> {
    const result: UpdateResult = await this.postsRepository.update(
      {
        id: postId,
        blogId: blogId,
      },
      {
        title: title,
        shortDescription: shortDescription,
        content: content,
      },
    );

    return result.affected === 1;

    // const query: string = `
    //   UPDATE posts
    //   SET title=$1, short_description=$2, content=$3
    //   WHERE id=$4 AND blog_id=$5
    // `;
    //
    // const result = await this.dataSource.query(query, [
    //   title,
    //   shortDescription,
    //   content,
    //   postId,
    //   blogId,
    // ]);
    //
    // const updatedRowsCount: number = result[1];
    //
    // return updatedRowsCount === 1;
  }

  async increaseLikesCount(id: number) {
    const result: UpdateResult = await this.postsRepository.update(
      { id },
      {
        likesCount: () => `likesCount + 1`,
      },
    );

    return result.affected === 1;

    // const query: string = `
    //   UPDATE posts
    //   SET likes_count = likes_count + 1
    //   WHERE id = $1
    // `;
    //
    // const result = this.dataSource.query(query, [id]);
    //
    // const updatedRowsCount: number = result[1];
    //
    // return updatedRowsCount === 1;
  }

  async decreaseLikesCount(id: number) {
    const result: UpdateResult = await this.postsRepository.update(
      { id },
      {
        likesCount: () => `GREATEST(likes_count - 1, 0)`,
      },
    );

    return result.affected === 1;

    // const query: string = `
    //   UPDATE posts
    //   SET likes_count = GREATEST(likes_count - 1, 0)
    //   WHERE id = $1
    // `;
    //
    // const result = this.dataSource.query(query, [id]);
    //
    // const updatedRowsCount: number = result[1];
    //
    // return updatedRowsCount === 1;
  }

  async increaseDislikesCount(id: number) {
    const result: UpdateResult = await this.postsRepository.update(
      { id },
      { dislikesCount: () => `dislikes_count + 1` },
    );

    return result.affected === 1;

    // const query: string = `
    //   UPDATE posts
    //   SET dislikes_count = dislikes_count + 1
    //   WHERE id = $1
    // `;
    //
    // const result = this.dataSource.query(query, [id]);
    //
    // const updatedRowsCount: number = result[1];
    //
    // return updatedRowsCount === 1;
  }

  async decreaseDislikesCount(id: number) {
    const result: UpdateResult = await this.postsRepository.update(
      { id },
      { dislikesCount: () => `GREATEST(dislikes_count - 1, 0)` },
    );

    return result.affected === 1;
    // const query: string = `
    //   UPDATE posts
    //   SET dislikes_count = GREATEST(dislikes_count - 1, 0)
    //   WHERE id = $1
    // `;
    //
    // const result = this.dataSource.query(query, [id]);
    //
    // const updatedRowsCount: number = result[1];
    //
    // return updatedRowsCount === 1;
  }

  // +
  async delete(blogId: number, postId: number): Promise<boolean> {
    // does not work: two conditions
    // const result: DeleteResult = await this.postsRepository.delete({
    //   id: postId,
    //   bogId: blogId,
    // });

    const result: DeleteResult = await this.postsRepository
      .createQueryBuilder()
      .delete()
      .from('post')
      .where('id = :postId AND blogId = :blogId', {
        postId: postId,
        blogId: blogId,
      })
      .execute();

    return result.affected === 1;
  }
}
