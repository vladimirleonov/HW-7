import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import { Model } from 'mongoose';
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
      blogId: blogId,
      blogName: blog.name,
      createdAt: new Date(),
    });

    await this.postsRepository.save(post);

    return {
      status: ResultStatus.Success,
      data: post.id,
    };
  }
}
