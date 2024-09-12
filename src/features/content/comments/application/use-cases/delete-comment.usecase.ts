import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../domain/comments.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Result } from '../../../../../base/types/object-result';

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand) {
    const { commentId, userId } = command;

    const comment: CommentDocument | null =
      await this.commentsRepository.findById(commentId);
    if (!comment) {
      return Result.notFound(`Comment with id ${comment} does not exist`);
      // return {
      //   status: ResultStatus.NotFound,
      //   extensions: [{field: 'userId', message: "Comment doesn't exist"}],
      //   data: null
      // }
    }

    if (comment.commentatorInfo.userId.toString() !== userId) {
      return Result.forbidden("Comment doesn't belongs to current user");
      // return {
      //   status: ResultStatus.Forbidden,
      //   extensions: [
      //     { field: 'userId', message: "Comment doesn't belongs to user" },
      //   ],
      //   data: null,
      // };
    }

    const isDeleted: boolean =
      await this.commentsRepository.deleteOne(commentId);
    if (!isDeleted) {
      return Result.internalError();
      // return {
      //   status: ResultStatus.InternalError,
      //   data: null,
      // };
    }

    // return {
    //   status: ResultStatus.Success,
    //   data: null,
    // };

    return Result.success();
  }
}
