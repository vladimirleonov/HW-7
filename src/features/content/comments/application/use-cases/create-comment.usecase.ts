import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { PostsPostgresRepository } from '../../../posts/infrastructure/postgres/posts-postgres.repository';
import { UsersPostgresRepository } from '../../../../users/infrastructure/postgresql/users-postgres.repository';
import { CommentsPostgresRepository } from '../../infrastructure/postgres/comments-postgres.repository';

export class CreateCommentCommand {
  constructor(
    public readonly postId: number,
    public readonly content: string,
    public readonly userId: number,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private readonly postsPostgresRepository: PostsPostgresRepository,
    private readonly usersPostgresRepository: UsersPostgresRepository,
    private readonly commentsPostgresRepository: CommentsPostgresRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const { postId, content, userId } = command;

    const post = await this.postsPostgresRepository.findById(postId);

    if (!post) {
      return Result.notFound(`Post with postId doesn't exist`);
    }

    const user = await this.usersPostgresRepository.findById(userId);

    if (!user) {
      return Result.unauthorized("User doesn't exist");
    }

    const commentId = await this.commentsPostgresRepository.create(
      postId,
      content,
      userId,
    );

    return Result.success(commentId);
  }
}
