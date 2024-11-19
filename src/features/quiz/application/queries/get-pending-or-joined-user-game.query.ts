import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameTypeormQueryRepository } from '../../infrastructure/game-typeorm.query-repository';
import { Game } from '../../domain/game.entity';
import { PlayerTypeormQueryRepository } from '../../infrastructure/player-typeorm.query-repository';
import { Result } from '../../../../base/types/object-result';

export class GetPendingOrJoinedUserGameQuery {
  constructor(public readonly playerId: number) {}
}

@QueryHandler(GetPendingOrJoinedUserGameQuery)
export class GetUserPendingOrJoinedGameUseCase
  implements IQueryHandler<GetPendingOrJoinedUserGameQuery>
{
  constructor(
    private readonly gameTypeormQueryRepository: GameTypeormQueryRepository,
    private readonly playerTypeormQueryRepository: PlayerTypeormQueryRepository,
  ) {}

  async execute(query: GetPendingOrJoinedUserGameQuery): Promise<Result<Game>> {
    const { playerId } = query;

    const player: boolean =
      await this.playerTypeormQueryRepository.checkPlayerExistsById(playerId);

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
