import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  Pagination,
  PaginationOutput,
} from '../../../../base/models/pagination.base.model';
import { PaginationQuery } from '../../../../base/models/pagination-query.input.model';
import { GameOutputModel } from '../../api/models/output/game.output.model';
import { Result } from '../../../../base/types/object-result';

export class GetAllUserGamesQuery {
  constructor(
    public readonly pagination: Pagination<PaginationQuery>,
    public readonly userId: number,
  ) {}
}

@QueryHandler(GetAllUserGamesQuery)
export class GetAllUserGamesUseCase
  implements IQueryHandler<GetAllUserGamesQuery>
{
  constructor() {}

  async execute(
    query: GetAllUserGamesQuery,
  ): Promise<Result<PaginationOutput<GameOutputModel>>> {
    const { pagination } = query;

    console.log(pagination);
  }
}
