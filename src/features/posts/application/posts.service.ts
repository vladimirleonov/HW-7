import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import mongoose, { Model } from 'mongoose';
import { BlogDocument } from '../../blogs/domain/blog.entity';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { Result, ResultStatus } from '../../../../base/types/object-result';

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
      return {
        status: ResultStatus.NotFound,
        extensions: [
          { field: 'blogId', message: `Blog with id ${blogId} not found` },
        ],
        data: null,
      };
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

    return {
      status: ResultStatus.Success,
      data: post.id,
    };
  }
  async update(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<Result<boolean>> {
    const post: PostDocument | null = await this.postsRepository.findById(id);
    if (!post) {
      return {
        status: ResultStatus.NotFound,
        extensions: [
          { field: 'postId', message: `Post with id ${id} not found` },
        ],
        data: false,
      };
    }

    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.blogId = new mongoose.Types.ObjectId(blogId);

    await this.postsRepository.save(post);

    return {
      status: ResultStatus.Success,
      data: true,
    };
  }
  async delete(id: string): Promise<Result<boolean>> {
    const isDeleted: boolean = await this.postsRepository.delete(id);

    if (isDeleted) {
      return {
        status: ResultStatus.Success,
        data: true,
      };
    } else {
      return {
        status: ResultStatus.NotFound,
        extensions: [
          { field: 'postId', message: `Post with id ${id} not found` },
        ],
        data: false,
      };
    }
  }
}
