import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPostgresRepository } from '../../infrastructure/postgres/posts-postgres.repository';
import { BlogsPostgresRepository } from '../../../blogs/infrastructure/postgres/blogs-postgres.repository';
import { Result } from '../../../../../base/types/object-result';

export class CreatePostCommand {
  constructor(
    public readonly title: string,
    public readonly shortDescription: string,
    public readonly content: string,
    public readonly blogId: number,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly blogsPostgresRepository: BlogsPostgresRepository,
    private readonly postsPostgresRepository: PostsPostgresRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const { title, shortDescription, content, blogId } = command;

    const blog = await this.blogsPostgresRepository.findById(command.blogId);

    if (!blog) {
      return Result.notFound(`Blog with id ${command.blogId} not found`);
    }

    const createdId: number = await this.postsPostgresRepository.create(
      title,
      shortDescription,
      content,
      blogId,
    );

    // const post: PostDocument = new this.postModel({
    //   title: command.title,
    //   shortDescription: command.shortDescription,
    //   content: command.content,
    //   blogId: new mongoose.Types.ObjectId(command.blogId),
    //   blogName: blog.name,
    //   likes: [],
    //   likesCount: 0,
    //   dislikesCount: 0,
    //   createdAt: new Date(),
    // }) as PostDocument;

    // await this.postsPostgresRepository.save(post);

    return Result.success(createdId);
  }
}
