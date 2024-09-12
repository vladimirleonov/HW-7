import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../domain/comments.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Result } from '../../../../../base/types/object-result';

export class UpdateCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly content: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, content, userId } = command;

    const comment: CommentDocument | null =
      await this.commentsRepository.findById(commentId);

    if (!comment) {
      return Result.notFound(`Comment with ${commentId} doesn't exist`);
    }

    if (userId !== comment.commentatorInfo.userId.toString()) {
      return Result.forbidden("Comment doesn't belongs to user");
    }

    const isUpdated: boolean = await this.commentsRepository.update(
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
