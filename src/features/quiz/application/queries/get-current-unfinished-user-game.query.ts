import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameTypeormQueryRepository } from '../../infrastructure/game/game-typeorm.query-repository';
import { Result } from '../../../../base/types/object-result';
import { GameOutputModel } from '../../api/models/output/game.output.model';

export class GetCurrentUnfinishedUserGameQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetCurrentUnfinishedUserGameQuery)
export class GetCurrentUnfinishedUserGameUseCase
  implements IQueryHandler<GetCurrentUnfinishedUserGameQuery>
{
  constructor(
    private readonly gameTypeormQueryRepository: GameTypeormQueryRepository,
  ) {}

  async execute(
    query: GetCurrentUnfinishedUserGameQuery,
  ): Promise<Result<GameOutputModel | null>> {
    const { userId } = query;

    const currentUnfinishedUserGame: GameOutputModel | null =
      await this.gameTypeormQueryRepository.getCurrentUnfinishedUserGame(
        userId,
      );

    if (!currentUnfinishedUserGame) {
      return Result.notFound(`There is no active pair for current user`);
    }

    return Result.success(currentUnfinishedUserGame);
  }
}
