import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameTypeormQueryRepository } from '../../infrastructure/game/game-typeorm.query-repository';
import { Result } from '../../../../base/types/object-result';
import { GameOutputModel } from '../../api/models/output/game.output.model';

export class GetPendingOrJoinedUserGameQuery {
  constructor(public readonly playerId: number) {}
}

@QueryHandler(GetPendingOrJoinedUserGameQuery)
export class GetUserPendingOrJoinedGameUseCase
  implements IQueryHandler<GetPendingOrJoinedUserGameQuery>
{
  constructor(
    private readonly gameTypeormQueryRepository: GameTypeormQueryRepository,
  ) {}

  async execute(
    query: GetPendingOrJoinedUserGameQuery,
  ): Promise<Result<GameOutputModel | null>> {
    const { playerId } = query;

    const playerPendingOrJoinedGame: GameOutputModel | null =
      await this.gameTypeormQueryRepository.getPlayerPendingOrJoinedGame(
        playerId,
      );

    if (!playerPendingOrJoinedGame) {
      return Result.notFound('Player is not in a game');
    }

    return Result.success(playerPendingOrJoinedGame);
  }
}
