import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { LikeStatus } from '../../../../../base/types/like-status';
import { PostLike } from '../../../like/domain/like.entity';

@Injectable()
export class PostLikesTypeormRepository {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikesRepository: Repository<PostLike>,
  ) {}

  async save(like: PostLike): Promise<void> {
    await this.postLikesRepository.save(like);
  }

  async findById(postId: number, userId: number): Promise<PostLike | null> {
    const post: PostLike | null = await this.postLikesRepository.findOneBy({
      postId: postId,
      authorId: userId,
    });

    return post;
  }

  async update(
    postId: number,
    userId: number,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const result: UpdateResult = await this.postLikesRepository.update(
      { postId },
      { authorId: userId, status: likeStatus },
    );

    return result.affected === 1;
  }

  async delete(postId: number, userId: number): Promise<boolean> {
    const result: DeleteResult = await this.postLikesRepository.delete({
      postId,
      authorId: userId,
    });

    return result.affected === 1;
  }
}
