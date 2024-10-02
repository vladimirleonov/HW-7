import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPostgresRepository } from '../../infrastructure/postgres/posts-postgres.repository';
import { LikeStatus } from '../../../../../base/types/like-status';
import { Result } from '../../../../../base/types/object-result';
import { PostLikesPostgresRepository } from '../../infrastructure/postgres/post-likes-postgres.repository';

export class UpdatePostLikeStatusCommand {
  constructor(
    public readonly likeStatus: LikeStatus,
    public readonly postId: number,
    public readonly userId: number,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    private readonly postsPostgresRepository: PostsPostgresRepository,
    private readonly postLikesPostgresRepository: PostLikesPostgresRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand) {
    const { likeStatus, postId, userId } = command;

    const post = await this.postsPostgresRepository.findById(postId);

    if (!post) {
      return Result.notFound(`Comment with ${postId} does not exist`);
    }

    const userLike = await this.postLikesPostgresRepository.findById(
      postId,
      userId,
    );

    // Add like to post likes
    if (!userLike) {
      console.log('was not like');
      // for input.likeStatus = None
      if (likeStatus === LikeStatus.None) {
        return Result.success();
      }

      await this.postLikesPostgresRepository.create(postId, userId, likeStatus);

      // for input.likeStatus = LikeStatus.Like
      if (likeStatus === LikeStatus.Like) {
        await this.postsPostgresRepository.increaseLikesCount(postId);
      }

      // for input.likeStatus = LikeStatus.Dislike
      if (likeStatus === LikeStatus.Dislike) {
        await this.postsPostgresRepository.increaseDislikesCount(postId);
      }

      return Result.success();
    }

    // LikeStatus the same
    if (userLike.status === likeStatus) {
      console.log('nothing change');
      return Result.success();
    }

    // LikeStatus None (Like exists)
    if (likeStatus === LikeStatus.None) {
      console.log('None');
      await this.postLikesPostgresRepository.delete(postId, userId);

      // was dislike
      if (userLike.status === LikeStatus.Dislike) {
        await this.postsPostgresRepository.decreaseDislikesCount(postId);
      }

      // was like
      if (userLike.status === LikeStatus.Like) {
        await this.postsPostgresRepository.decreaseLikesCount(postId);
      }

      return Result.success();
    }

    // LikeStatus different (status Like)
    if (likeStatus === LikeStatus.Like) {
      console.log('like');
      await this.postLikesPostgresRepository.update(postId, userId, likeStatus);

      // was dislike
      if (userLike.status === LikeStatus.Dislike) {
        await this.postsPostgresRepository.decreaseDislikesCount(postId);
      }
      await this.postsPostgresRepository.increaseLikesCount(postId);

      return Result.success();
    }

    // LikeStatus different (Like exists)
    if (likeStatus === LikeStatus.Dislike) {
      console.log('dislike');
      await this.postLikesPostgresRepository.update(postId, userId, likeStatus);

      // was like
      if (userLike.status === LikeStatus.Like) {
        await this.postsPostgresRepository.decreaseLikesCount(postId);
      }
      await this.postsPostgresRepository.increaseDislikesCount(postId);

      return Result.success();
    }

    return Result.success();
  }
}
