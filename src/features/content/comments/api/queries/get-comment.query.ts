import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsTypeormQueryRepository } from '../../infrastructure/typeorm/comments-typeorm.query-repository';

export class GetCommentQuery {
  constructor(
    public readonly commentId: number,
    public readonly userId?: number,
  ) {}
}

@QueryHandler(GetCommentQuery)
export class GetCommentUseCase implements IQueryHandler<GetCommentQuery> {
  constructor(
    private readonly commentsTypeormQueryRepository: CommentsTypeormQueryRepository,
  ) {}

  execute(query: GetCommentQuery): Promise<any> {
    const { commentId, userId } = query;

    return this.commentsTypeormQueryRepository.getOne(commentId, userId);
  }
}
