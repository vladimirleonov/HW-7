import { CommandHandler } from '@nestjs/cqrs';
import { PostsPostgresRepository } from '../../infrastructure/postgres/posts-postgres.repository';
import { Result } from '../../../../../base/types/object-result';

export class DeleteBlogPostCommand {
  constructor(
    public readonly blogId: number,
    public readonly postId: number,
  ) {}
}

@CommandHandler(DeleteBlogPostCommand)
export class DeleteBlogPostUseCase {
  constructor(
    public readonly postsPostgresRepository: PostsPostgresRepository,
  ) {}

  async execute(command: DeleteBlogPostCommand) {
    const { blogId, postId } = command;

    const isDeleted = await this.postsPostgresRepository.delete(blogId, postId);

    if (!isDeleted) {
      return Result.notFound(
        `Post with id ${postId} and blog id ${blogId} does not exist`,
      );
    }

    return Result.success();
  }
}