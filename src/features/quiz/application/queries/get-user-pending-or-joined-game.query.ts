import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameTypeormQueryRepository } from '../../infrastructure/game-typeorm.query-repository';
import { Game } from '../../domain/game.entity';
import { PlayerTypeormQueryRepository } from '../../infrastructure/player-typeorm.query-repository';
import { Result } from '../../../../base/types/object-result';

export class GetUserPendingOrJoinedGameQuery {
  constructor(public readonly playerId: number) {}
}

@QueryHandler(GetUserPendingOrJoinedGameQuery)
export class GetUserPendingOrJoinedGameUseCase
  implements IQueryHandler<GetUserPendingOrJoinedGameQuery>
{
  constructor(
    private readonly gameTypeormQueryRepository: GameTypeormQueryRepository,
    private readonly playerTypeormQueryRepository: PlayerTypeormQueryRepository,
  ) {}

  async execute(query: GetUserPendingOrJoinedGameQuery): Promise<Result<Game>> {
    const { playerId } = query;

    const player: boolean =
      await this.playerTypeormQueryRepository.checkPlayerExists(playerId);

    // TODO: if !player
    if (!player) {
      return Result.notFound('Player not found');
    }

    const playerPendingOrJoinedGame: Game | null =
      await this.gameTypeormQueryRepository.getPlayerPendingOrJoinedGame(
        playerId,
      );

    // TODO: if !game
    if (!playerPendingOrJoinedGame) {
      return Result.notFound('Player is not in a game');
    }

    return Result.success(playerPendingOrJoinedGame);
  }
}
