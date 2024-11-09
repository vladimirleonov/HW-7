import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsTypeormRepository } from '../../infrastructure/typeorm/posts-typeorm.repository';
import { BlogsTypeormRepository } from '../../../blogs/infrastructure/typeorm/blogs-typeorm.repository';
import { Result } from '../../../../../base/types/object-result';
import { Blog } from '../../../blogs/domain/blog.entity';
import { Post } from '../../domain/post.entity';

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
    private readonly blogsTypeormRepository: BlogsTypeormRepository,
    private readonly postsTypeormRepository: PostsTypeormRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const { title, shortDescription, content, blogId } = command;

    const blog: Blog | null = await this.blogsTypeormRepository.findById(
      command.blogId,
    );

    if (!blog) {
      return Result.notFound(`Blog with id ${command.blogId} not found`);
    }

    const post: Post = Post.create(title, shortDescription, content, blogId);

    await this.postsTypeormRepository.save(post);

    const postId: number = post.id;

    // const createdId: number = await this.postsTypeormRepository.create(
    //   title,
    //   shortDescription,
    //   content,
    //   blogId,
    // );

    return Result.success(postId);
  }
}
