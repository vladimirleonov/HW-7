import { IQueryHandler } from '@nestjs/cqrs';
import { PostsTypeormQueryRepository } from '../typeorm/posts-typeorm.query-repository';
import { Post } from '../../domain/post.entity';

export class GetPostQuery {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}

export class GetPostUseCase implements IQueryHandler {
  constructor(
    private readonly postsTypeormQueryRepository: PostsTypeormQueryRepository,
  ) {}

  execute(query: GetPostQuery): Promise<Post | null> {
    const { id, userId } = query;

    return this.postsTypeormQueryRepository.getOne(id, userId);
  }
}
