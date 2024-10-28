import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { CommentsTypeormRepository } from '../../infrastructure/typeorm/comments-typeorm.repository';

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
    private readonly commentsTypeormRepository: CommentsTypeormRepository,
  ) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, content, userId } = command;

    const comment = await this.commentsTypeormRepository.findById(commentId);

    if (!comment) {
      return Result.notFound(`Comment with ${commentId} doesn't exist`);
    }

    if (userId !== comment.commentatorId) {
      return Result.forbidden("Comment doesn't belongs to user");
    }

    const isUpdated: boolean = await this.commentsTypeormRepository.update(
      commentId,
      content,
    );

    // TODO: should check !isUpdated???
    if (!isUpdated) {
      // return Result.internalError
    }

    return Result.success();
  }
}
