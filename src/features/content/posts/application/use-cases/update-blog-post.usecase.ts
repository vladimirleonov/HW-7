import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsTypeormRepository } from '../../infrastructure/typeorm/posts-typeorm.repository';
import { Result } from '../../../../../base/types/object-result';

export class UpdateBlogPostCommand {
  constructor(
    public readonly title: string,
    public readonly shortDescription: string,
    public readonly content: string,
    public readonly blogId: number,
    public readonly postId: number,
  ) {}
}

@CommandHandler(UpdateBlogPostCommand)
export class UpdateBlogPostUseCase
  implements ICommandHandler<UpdateBlogPostCommand>
{
  constructor(
    private readonly postsTypeormRepository: PostsTypeormRepository,
  ) {}

  async execute(command: UpdateBlogPostCommand) {
    const { title, shortDescription, content, blogId, postId } = command;

    const post = await this.postsTypeormRepository.findByPostIdAndBlogId(
      postId,
      blogId,
    );

    if (!post) {
      return Result.notFound(
        `Post with id ${postId} and blog id ${blogId} does not exist`,
      );
    }

    await this.postsTypeormRepository.update(
      title,
      shortDescription,
      content,
      blogId,
      postId,
    );

    return Result.success();
  }
}
