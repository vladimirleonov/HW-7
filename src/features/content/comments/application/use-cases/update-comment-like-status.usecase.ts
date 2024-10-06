import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { LikeStatus } from '../../../../../base/types/like-status';
import { CommentsPostgresRepository } from '../../infrastructure/postgres/comments-postgres.repository';
import { CommentLikesPostgresRepository } from '../../infrastructure/postgres/comment-likes-postgres.repository';

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
    private readonly commentsPostgresRepository: CommentsPostgresRepository,
    private readonly commentLikesPostgresRepository: CommentLikesPostgresRepository,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand) {
    const { commentId, likeStatus, userId } = command;

    const comment = await this.commentsPostgresRepository.findById(commentId);

    if (!comment) {
      return Result.notFound(
        `Comment with ${command.commentId} does not exist`,
      );
    }

    // get user like
    const userLike = await this.commentLikesPostgresRepository.findById(
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

      await this.commentLikesPostgresRepository.create(
        commentId,
        userId,
        likeStatus,
      );

      // for input.likeStatus = LikeStatus.Like
      if (command.likeStatus === LikeStatus.Like) {
        await this.commentsPostgresRepository.increaseLikesCount(commentId);
      }

      // for input.likeStatus = LikeStatus.Dislike
      if (command.likeStatus === LikeStatus.Dislike) {
        await this.commentsPostgresRepository.increaseDislikesCount(commentId);
      }
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

      await this.commentLikesPostgresRepository.delete(commentId, userId);

      // was dislike
      if (userLike.status === LikeStatus.Dislike) {
        await this.commentsPostgresRepository.decreaseDislikesCount(commentId);
      }

      // was like
      if (userLike.status === LikeStatus.Like) {
        await this.commentsPostgresRepository.decreaseLikesCount(commentId);
      }
    }

    // Existing like with different status Like
    if (command.likeStatus === LikeStatus.Like) {
      console.log('Like');
      await this.commentLikesPostgresRepository.update(
        commentId,
        userId,
        likeStatus,
      );

      // was dislike
      if (userLike.status === LikeStatus.Dislike) {
        await this.commentsPostgresRepository.decreaseDislikesCount(commentId);
      }

      await this.commentsPostgresRepository.increaseLikesCount(commentId);
    }
    // Existing like with different status Dislike
    if (likeStatus === LikeStatus.Dislike) {
      console.log('Dislike');
      await this.commentLikesPostgresRepository.update(
        commentId,
        userId,
        likeStatus,
      );

      // was like
      if (userLike.status === LikeStatus.Like) {
        await this.commentsPostgresRepository.decreaseLikesCount(commentId);
      }

      await this.commentsPostgresRepository.increaseDislikesCount(commentId);
    }

    return Result.success();
  }
}
