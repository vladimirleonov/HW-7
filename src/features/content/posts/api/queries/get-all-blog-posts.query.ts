import {
  Pagination,
  PaginationOutput,
} from '../../../../../base/models/pagination.base.model';
import { PaginationQueryParams } from '../../../../../base/models/pagination-query.input.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsTypeormQueryRepository } from '../../infrastructure/typeorm/posts-typeorm.query-repository';
import { Post } from '../../domain/post.entity';

export class GetAllBlogPostsQuery {
  constructor(
    public readonly pagination: Pagination<PaginationQueryParams>,
    public readonly blogId: number,
    public readonly userId?: number,
  ) {}
}

@QueryHandler(GetAllBlogPostsQuery)
export class GetAllBlogPostsUseCase
  implements IQueryHandler<GetAllBlogPostsQuery>
{
  constructor(
    private readonly postsTypeormQueryRepository: PostsTypeormQueryRepository,
  ) {}

  async execute(query: GetAllBlogPostsQuery): Promise<PaginationOutput<Post>> {
    const { pagination, blogId, userId } = query;

    return this.postsTypeormQueryRepository.getAllBlogPosts(
      pagination,
      blogId,
      userId,
    );
  }
}
