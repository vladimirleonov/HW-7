import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { CommentsPostgresRepository } from '../../infrastructure/postgres/comments-postgres.repository';

export class UpdateCommentCommand {
  constructor(
    public readonly commentId: number,
    public readonly content: string,
    public readonly userId: number,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private readonly commentsPostgresRepository: CommentsPostgresRepository,
  ) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, content, userId } = command;

    const comment = await this.commentsPostgresRepository.findById(commentId);

    if (!comment) {
      return Result.notFound(`Comment with ${commentId} doesn't exist`);
    }

    if (userId !== comment.commentator_id) {
      return Result.forbidden("Comment doesn't belongs to user");
    }

    const isUpdated: boolean = await this.commentsPostgresRepository.update(
      commentId,
      content,
    );

    //TODO: should check !isUpdated???
    if (!isUpdated) {
      // return Result.internalError
    }

    return Result.success();
  }
}
