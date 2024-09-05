import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Result } from '../../../../base/types/object-result';
import { LikeStatus } from '../../../like/domain/like.entity';

export class UpdatePostLikeStatusCommand {
  constructor(
    public readonly likeStatus: LikeStatus,
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: UpdatePostLikeStatusCommand) {
    const { likeStatus, postId, userId } = command;

    const post: PostDocument | null =
      await this.postsRepository.findById(postId);
    if (!post) {
      return Result.notFound(`Comment with ${postId} does not exist`);
    }

    post.updateLikeStatus(userId, likeStatus);

    await this.postsRepository.save(post);

    return Result.success();
  }
}
