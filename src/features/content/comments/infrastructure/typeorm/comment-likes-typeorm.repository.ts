import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { LikeStatus } from '../../../../../base/types/like-status';
import { CommentLike } from '../../../like/domain/like.entity';

export class CommentLikesTypeormRepository {
  constructor(
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
  ) {}

  async save(like: CommentLike): Promise<void> {
    await this.commentLikeRepository.save(like);
  }

  async findById(
    commentId: number,
    userId: number,
  ): Promise<CommentLike | null> {
    // CommentLike | null
    return this.commentLikeRepository.findOneBy({
      commentId,
      authorId: userId,
    });
  }

  async update(
    commentId: number,
    userId: number,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const result: UpdateResult = await this.commentLikeRepository.update(
      { commentId, authorId: userId },
      { status: likeStatus },
    );

    return result.affected === 1;
  }

  async delete(commentId: number, userId: number): Promise<boolean> {
    const result: DeleteResult = await this.commentLikeRepository.delete({
      commentId,
      authorId: userId,
    });

    return result.affected === 1;
  }
}
