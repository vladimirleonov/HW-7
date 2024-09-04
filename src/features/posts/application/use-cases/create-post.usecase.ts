import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogDocument } from '../../../blogs/domain/blog.entity';
import { Result } from '../../../../base/types/object-result';
import { Post, PostDocument } from '../../domain/post.entity';
import mongoose, { Model } from 'mongoose';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class CreatePostCommand {
  constructor(
    public readonly title: string,
    public readonly shortDescription: string,
    public readonly content: string,
    public readonly blogId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostCommandUseCase
  implements ICommandHandler<CreatePostCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async execute(command: CreatePostCommand) {
    const blog: BlogDocument | null = await this.blogsRepository.findById(
      command.blogId,
    );

    if (!blog) {
      return Result.notFound(`Blog with id ${command.blogId} not found`);
    }

    const post: PostDocument = new this.postModel({
      title: command.title,
      shortDescription: command.shortDescription,
      content: command.content,
      blogId: new mongoose.Types.ObjectId(command.blogId),
      blogName: blog.name,
      createdAt: new Date(),
    });

    await this.postsRepository.save(post);

    return Result.success(post.id);
  }
}
