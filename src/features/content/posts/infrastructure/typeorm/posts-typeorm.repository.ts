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
  }

  async findByPostIdAndBlogId(postId: number, blogId: number) {
    // Post | null
    return await this.postsRepository.findOneBy({
      id: postId,
      blogId: blogId,
    });
  }

  async create(
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
  ): Promise<number> {
    const createdPost: Post = await this.postsRepository.save({
      title: title,
      shortDescription: shortDescription,
      content: content,
      blogId: blogId,
    });

    const postId: number = createdPost.id;

    return postId;
  }

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
  }

  async delete(blogId: number, postId: number): Promise<boolean> {
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
