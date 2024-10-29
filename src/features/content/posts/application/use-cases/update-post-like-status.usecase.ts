import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsTypeormRepository } from '../../infrastructure/typeorm/posts-typeorm.repository';
import { LikeStatus } from '../../../../../base/types/like-status';
import { Result } from '../../../../../base/types/object-result';
import { PostLikesTypeormRepository } from '../../infrastructure/typeorm/post-likes-typeorm.repository';
import { PostLike } from '../../../like/domain/like.entity';

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
    private readonly postsTypeormRepository: PostsTypeormRepository,
    private readonly postLikesTypeormRepository: PostLikesTypeormRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand) {
    const { likeStatus, postId, userId } = command;

    const post = await this.postsTypeormRepository.findById(postId);

    if (!post) {
      return Result.notFound(`Comment with ${postId} does not exist`);
    }

    const userLike: PostLike | null =
      await this.postLikesTypeormRepository.findById(postId, userId);

    // Add like to post likes
    if (!userLike) {
      console.log('was not like');
      // for input.likeStatus = None
      if (likeStatus === LikeStatus.None) {
        return Result.success();
      }

      const like: PostLike = PostLike.create(postId, userId, likeStatus);

      await this.postLikesTypeormRepository.save(like);

      return Result.success();
    }

    // LikeStatus the same
    if (userLike.status === likeStatus) {
      console.log('the same status');
      return Result.success();
    }

    // LikeStatus None (Like exists)
    if (likeStatus === LikeStatus.None) {
      console.log('None');
      await this.postLikesTypeormRepository.delete(postId, userId);

      return Result.success();
    }

    // LikeStatus different (status Like)
    if (likeStatus === LikeStatus.Like) {
      console.log('like');
      await this.postLikesTypeormRepository.update(postId, userId, likeStatus);

      return Result.success();
    }

    // LikeStatus different (Like exists)
    if (likeStatus === LikeStatus.Dislike) {
      console.log('dislike');
      await this.postLikesTypeormRepository.update(postId, userId, likeStatus);

      return Result.success();
    }

    return Result.success();
  }
}
