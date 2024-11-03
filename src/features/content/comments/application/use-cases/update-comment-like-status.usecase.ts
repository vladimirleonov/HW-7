import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { LikeStatus } from '../../../../../base/types/like-status';
import { CommentsTypeormRepository } from '../../infrastructure/typeorm/comments-typeorm.repository';
import { CommentLikesTypeormRepository } from '../../infrastructure/typeorm/comment-likes-typeorm.repository';
import { CommentLike } from '../../../like/domain/like.entity';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public readonly commentId: number,
    public readonly likeStatus: LikeStatus,
    public readonly userId: number,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand>
{
  constructor(
    private readonly commentsTypeormRepository: CommentsTypeormRepository,
    private readonly commentLikesTypeormRepository: CommentLikesTypeormRepository,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand) {
    const { commentId, likeStatus, userId } = command;

    const comment = await this.commentsTypeormRepository.findById(commentId);

    if (!comment) {
      return Result.notFound(
        `Comment with ${command.commentId} does not exist`,
      );
    }

    // get user like
    const userLike = await this.commentLikesTypeormRepository.findById(
      commentId,
      userId,
    );
    console.log('userLike', userLike);

    // add like to comment likes
    if (!userLike) {
      console.log('!userLike');
      // for input.likeStatus = None
      if (command.likeStatus === LikeStatus.None) {
        return Result.success();
      }

      const like: CommentLike = CommentLike.create(
        commentId,
        userId,
        likeStatus,
      );

      await this.commentLikesTypeormRepository.save(like);

      return Result.success();
    }

    // Existing like with same status
    if (userLike.status === command.likeStatus) {
      console.log('nothing change');
      return Result.success();
    }

    // Existing like with status None
    if (command.likeStatus === LikeStatus.None) {
      console.log('None');

      await this.commentLikesTypeormRepository.delete(commentId, userId);
    }

    // Existing like with different status Like
    if (command.likeStatus === LikeStatus.Like) {
      console.log('Like');
      await this.commentLikesTypeormRepository.update(
        commentId,
        userId,
        likeStatus,
      );
    }
    // Existing like with different status Dislike
    if (likeStatus === LikeStatus.Dislike) {
      console.log('Dislike');
      await this.commentLikesTypeormRepository.update(
        commentId,
        userId,
        likeStatus,
      );
    }

    return Result.success();
  }
}
