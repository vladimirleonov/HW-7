import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  PaginationOutput,
  PaginationWithScores,
} from '../../../../base/models/pagination.base.model';
import { Result } from '../../../../base/types/object-result';
import { GameOutputModel } from '../../api/models/output/game.output.model';
import { GameTypeormQueryRepository } from '../../infrastructure/game/game-typeorm.query-repository';
import { MultiSortQueryParams } from '../../../../base/models/pagination-query.input.model';

export class GetAllUserGamesQuery {
  constructor(
    public readonly pagination: PaginationWithScores<MultiSortQueryParams>,
    public readonly userId: number,
  ) {}
}

@QueryHandler(GetAllUserGamesQuery)
export class GetAllUserGamesUseCase
  implements IQueryHandler<GetAllUserGamesQuery>
{
  constructor(
    private readonly gameTypeormQueryRepository: GameTypeormQueryRepository,
  ) {}

  async execute(
    query: GetAllUserGamesQuery,
  ): Promise<Result<PaginationOutput<GameOutputModel>>> {
    const { pagination, userId } = query;

    const result: PaginationOutput<GameOutputModel> =
      await this.gameTypeormQueryRepository.getAllUserGames(pagination, userId);

    return Result.success(result);
  }
}
