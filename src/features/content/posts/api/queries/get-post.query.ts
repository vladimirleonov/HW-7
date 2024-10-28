import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsTypeormQueryRepository } from '../../infrastructure/typeorm/posts-typeorm.query-repository';
import { Post } from '../../domain/post.entity';
import { GetAllPostsQuery } from './get-all-posts.query';

export class GetPostQuery {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetPostUseCase implements IQueryHandler {
  constructor(
    private readonly postsTypeormQueryRepository: PostsTypeormQueryRepository,
  ) {}

  execute(query: GetPostQuery): Promise<Post | null> {
    const { id, userId } = query;

    return this.postsTypeormQueryRepository.getOne(id, userId);
  }
}
