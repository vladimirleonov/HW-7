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
  ) {
  }
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand> {
  constructor(
    private readonly postsPostgresRepository: PostsPostgresRepository,
    private readonly postLikesPostgresRepository: PostLikesPostgresRepository,
  ) {
  }

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

      return Result.success();
    }

    // LikeStatus different (Like exists)
    if (likeStatus === LikeStatus.Like || likeStatus === LikeStatus.Dislike) {
      console.log('Like or dislike');
      await this.postLikesPostgresRepository.update(postId, userId, likeStatus);

      return Result.success();
    }

    return Result.success();
  }
}
