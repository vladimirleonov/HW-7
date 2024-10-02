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

    const comment = await this.commentsPostgresRepository.findById(
      command.commentId,
    );

    if (!comment) {
      return Result.notFound(
        `Comment with ${command.commentId} does not exist`,
      );
    }

    // get use like
    const userLike = await this.commentLikesPostgresRepository.findById(
      commentId,
      userId,
    );
    // const userLike: Like | undefined = comment.likes.find(
    //   (like) => like.authorId.toString() === command.userId,
    // );

    // add like to comment likes
    if (!userLike) {
      console.log('!userLike');
      // for input.likeStatus = None
      if (command.likeStatus === LikeStatus.None) {
        return Result.success();
      }
      // input.likeStatus = (LikeStatus.Like || LikeStatus.Dislike)

      const likeToAdd = new this.likeModel({
        createdAt: new Date(),
        status: command.likeStatus,
        authorId: command.userId,
      });

      comment.likes.push(likeToAdd);
      // for input.likeStatus = LikeStatus.Like
      if (command.likeStatus === LikeStatus.Like) comment.likesCount += 1;
      // for input.likeStatus = LikeStatus.Dislike
      if (command.likeStatus === LikeStatus.Dislike) comment.dislikesCount += 1;

      await this.commentsRepository.save(comment);
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
      comment.likes = comment.likes.filter(
        (like: Like) => like.authorId.toString() !== command.userId,
      );
      // was dislike
      if (userLike.status === LikeStatus.Dislike) comment.dislikesCount -= 1;
      // was like
      if (userLike.status === LikeStatus.Like) comment.likesCount -= 1;
    }
    // Existing like with different status Like
    if (command.likeStatus === LikeStatus.Like) {
      console.log('Like');
      // was dislike
      if (userLike.status === LikeStatus.Dislike) comment.dislikesCount -= 1;
      comment.likesCount += 1;

      userLike.status = command.likeStatus;
      userLike.createdAt = new Date();
    }
    // Existing like with different status Dislike
    if (command.likeStatus === LikeStatus.Dislike) {
      console.log('Dislike');
      // was like
      if (userLike.status === LikeStatus.Like) comment.likesCount -= 1;
      comment.dislikesCount += 1;

      userLike.status = command.likeStatus;
      userLike.createdAt = new Date();
    }

    // await this.commentsRepository.save(comment);

    return Result.success();
  }
}
