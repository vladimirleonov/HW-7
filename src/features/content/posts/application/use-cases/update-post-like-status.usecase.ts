import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsTypeormRepository } from '../../infrastructure/typeorm/posts-typeorm.repository';
import { LikeStatus } from '../../../../../base/types/like-status';
import { Result } from '../../../../../base/types/object-result';
import { PostLikesTypeormRepository } from '../../infrastructure/typeorm/post-likes-typeorm.repository';

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

    const userLike = await this.postLikesTypeormRepository.findById(
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

      await this.postLikesTypeormRepository.create(postId, userId, likeStatus);

      // for input.likeStatus = LikeStatus.Like
      if (likeStatus === LikeStatus.Like) {
        await this.postsTypeormRepository.increaseLikesCount(postId);
      }

      // for input.likeStatus = LikeStatus.Dislike
      if (likeStatus === LikeStatus.Dislike) {
        await this.postsTypeormRepository.increaseDislikesCount(postId);
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
      await this.postLikesTypeormRepository.delete(postId, userId);

      // was dislike
      if (userLike.status === LikeStatus.Dislike) {
        await this.postsTypeormRepository.decreaseDislikesCount(postId);
      }

      // was like
      if (userLike.status === LikeStatus.Like) {
        await this.postsTypeormRepository.decreaseLikesCount(postId);
      }

      return Result.success();
    }

    // LikeStatus different (status Like)
    if (likeStatus === LikeStatus.Like) {
      console.log('like');
      await this.postLikesTypeormRepository.update(postId, userId, likeStatus);

      // was dislike
      if (userLike.status === LikeStatus.Dislike) {
        await this.postsTypeormRepository.decreaseDislikesCount(postId);
      }
      await this.postsTypeormRepository.increaseLikesCount(postId);

      return Result.success();
    }

    // LikeStatus different (Like exists)
    if (likeStatus === LikeStatus.Dislike) {
      console.log('dislike');
      await this.postLikesTypeormRepository.update(postId, userId, likeStatus);

      // was like
      if (userLike.status === LikeStatus.Like) {
        await this.postsTypeormRepository.decreaseLikesCount(postId);
      }
      await this.postsTypeormRepository.increaseDislikesCount(postId);

      return Result.success();
    }

    return Result.success();
  }
}
