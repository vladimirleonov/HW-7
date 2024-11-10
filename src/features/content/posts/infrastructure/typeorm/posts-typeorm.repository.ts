import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Post } from '../../domain/post.entity';

@Injectable()
export class PostsTypeormRepository {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
  ) {}

  async save(post: Post): Promise<void> {
    await this.postsRepository.save(post);
  }

  async findById(id: number): Promise<Post | null> {
    // Post | null
    return await this.postsRepository.findOneBy({
      id,
    });
  }

  async findByPostIdAndBlogId(
    postId: number,
    blogId: number,
  ): Promise<Post | null> {
    // Post | null
    return await this.postsRepository.findOneBy({
      id: postId,
      blogId: blogId,
    });
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
