import { CommandHandler } from '@nestjs/cqrs';
import { PostsTypeormRepository } from '../../infrastructure/typeorm/posts-typeorm.repository';
import { Result } from '../../../../../base/types/object-result';

export class DeleteBlogPostCommand {
  constructor(
    public readonly blogId: number,
    public readonly postId: number,
  ) {}
}

@CommandHandler(DeleteBlogPostCommand)
export class DeleteBlogPostUseCase {
  constructor(public readonly postsTypeormRepository: PostsTypeormRepository) {}

  async execute(command: DeleteBlogPostCommand): Promise<Result> {
    const { blogId, postId } = command;

    const isDeleted = await this.postsTypeormRepository.delete(blogId, postId);

    if (!isDeleted) {
      return Result.notFound(
        `Post with id ${postId} and blog id ${blogId} does not exist`,
      );
    }

    return Result.success();
  }
}
