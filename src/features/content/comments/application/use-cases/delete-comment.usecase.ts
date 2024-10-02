import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { CommentsPostgresRepository } from '../../infrastructure/postgres/comments-postgres.repository';

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: number,
    public readonly userId: number,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private readonly commentsPostgresRepository: CommentsPostgresRepository,
  ) {}

  async execute(command: DeleteCommentCommand) {
    const { commentId, userId } = command;

    const comment = await this.commentsPostgresRepository.findById(commentId);

    if (!comment) {
      return Result.notFound(`Comment with id ${comment} does not exist`);
    }

    if (comment.commentator_id !== userId) {
      return Result.forbidden("Comment doesn't belongs to current user");
    }

    const isDeleted: boolean =
      await this.commentsPostgresRepository.delete(commentId);
    if (!isDeleted) {
      return Result.internalError();
    }

    return Result.success();
  }
}
