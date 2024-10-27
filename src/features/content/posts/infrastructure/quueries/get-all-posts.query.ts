import {
  Pagination,
  PaginationOutput,
} from '../../../../../base/models/pagination.base.model';
import { PaginationQuery } from '../../../../../base/models/pagination-query.input.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsTypeormQueryRepository } from '../typeorm/posts-typeorm.query-repository';
import { Post } from '../../domain/post.entity';

export class GetAllPostsQuery {
  constructor(
    public readonly pagination: Pagination<PaginationQuery>,
    public readonly userId?: number,
  ) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsUseCase implements IQueryHandler {
  constructor(
    private readonly postsTypeormQueryRepository: PostsTypeormQueryRepository,
  ) {}

  async execute(query: GetAllPostsQuery): Promise<PaginationOutput<Post>> {
    const { pagination, userId } = query;

    return this.postsTypeormQueryRepository.getAllPosts(pagination, userId);
  }
}
