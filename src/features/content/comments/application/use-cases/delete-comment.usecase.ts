import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { CommentsTypeormRepository } from '../../infrastructure/typeorm/comments-typeorm.repository';

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
    private readonly commentsTypeormRepository: CommentsTypeormRepository,
  ) {}

  async execute(command: DeleteCommentCommand) {
    const { commentId, userId } = command;

    const comment = await this.commentsTypeormRepository.findById(commentId);

    if (!comment) {
      return Result.notFound(`Comment with id ${comment} does not exist`);
    }

    if (comment.commentator_id !== userId) {
      return Result.forbidden("Comment doesn't belongs to current user");
    }

    const isDeleted: boolean =
      await this.commentsTypeormRepository.delete(commentId);
    if (!isDeleted) {
      return Result.internalError();
    }

    return Result.success();
  }
}
