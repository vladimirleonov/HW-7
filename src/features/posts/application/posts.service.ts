import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import mongoose, { Model } from 'mongoose';
import { BlogDocument } from '../../blogs/domain/blog.entity';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { Result } from '../../../base/types/object-result';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async create(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<Result<string | null>> {
    const blog: BlogDocument | null =
      await this.blogsRepository.findById(blogId);

    if (!blog) {
      return Result.notFound(`Blog with id ${blogId} not found`);
    }

    const post: PostDocument = new this.postModel({
      title: title,
      shortDescription: shortDescription,
      content: content,
      blogId: new mongoose.Types.ObjectId(blogId),
      blogName: blog.name,
      createdAt: new Date(),
    });

    await this.postsRepository.save(post);

    return Result.success(post.id);
  }
  async update(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<Result> {
    const post: PostDocument | null = await this.postsRepository.findById(id);
    if (!post) {
      return Result.notFound(`Post with id ${id} not found`);
    }

    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.blogId = new mongoose.Types.ObjectId(blogId);

    await this.postsRepository.save(post);

    return Result.success();
  }
  async delete(id: string): Promise<Result> {
    const isDeleted: boolean = await this.postsRepository.delete(id);

    if (isDeleted) {
      return Result.success();
    } else {
      return Result.notFound();
    }
  }
}
