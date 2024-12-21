import { PaginationQueryParams } from '../../../../../base/models/pagination-query.input.model';
import {
  Pagination,
  PaginationOutput,
} from '../../../../../base/models/pagination.base.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Comment } from '../../domain/comment.entity';
import { CommentsTypeormQueryRepository } from '../../infrastructure/typeorm/comments-typeorm.query-repository';

export class GetPostCommentsQuery {
  constructor(
    public readonly pagination: Pagination<PaginationQueryParams>,
    public readonly postId: number,
    public readonly userId: number,
  ) {}
}

@QueryHandler(GetPostCommentsQuery)
export class GetPostCommentsUseCase implements IQueryHandler {
  constructor(
    private readonly commentsTypeormQueryRepository: CommentsTypeormQueryRepository,
  ) {}

  execute(query: GetPostCommentsQuery): Promise<PaginationOutput<Comment>> {
    const { pagination, postId, userId } = query;

    return this.commentsTypeormQueryRepository.getAllPostComments(
      pagination,
      postId,
      userId,
    );
  }
}
