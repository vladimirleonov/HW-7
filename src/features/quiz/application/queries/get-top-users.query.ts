import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  PaginationOutput,
  PaginationWithScores,
} from '../../../../base/models/pagination.base.model';
import { Result } from '../../../../base/types/object-result';
import { TopUserOutputModel } from '../../api/models/output/top-user.output.model';
import { PlayerTypeormQueryRepository } from '../../infrastructure/player/player-typeorm.query-repository';
import { MultiSortQueryParams } from '../../../../base/models/pagination-query.input.model';

export class GetTopUsersQuery {
  constructor(
    public readonly pagination: PaginationWithScores<MultiSortQueryParams>,
  ) {}
}

@QueryHandler(GetTopUsersQuery)
export class GetTopUsersUseCase implements IQueryHandler<GetTopUsersQuery> {
  constructor(
    private readonly playerTypeormQueryRepository: PlayerTypeormQueryRepository,
  ) {}

  async execute(
    query: GetTopUsersQuery,
  ): Promise<Result<PaginationOutput<TopUserOutputModel>>> {
    const { pagination } = query;

    const result: PaginationOutput<TopUserOutputModel> =
      await this.playerTypeormQueryRepository.getTopUsers(pagination);

    return Result.success(result);
  }
}
