import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogDocument } from '../../../blogs/domain/blog.entity';
import { Result } from '../../../../../base/types/object-result';
import { Post, PostDocument } from '../../domain/post.entity';
import mongoose, { Model } from 'mongoose';
import { BlogsMongoRepository } from '../../../blogs/infrastructure/mongo/blogs-mongo.repository';
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
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly blogsRepository: BlogsMongoRepository,
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
      likes: [],
      likesCount: 0,
      dislikesCount: 0,
      createdAt: new Date(),
    }) as PostDocument;

    await this.postsRepository.save(post);

    return Result.success(post.id);
  }
}
