import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Game } from '../../domain/game.entity';
import { GameTypeormQueryRepository } from '../../infrastructure/game-typeorm.query-repository';
import { PlayerTypeormQueryRepository } from '../../infrastructure/player-typeorm.query-repository';
import { Result } from '../../../../base/types/object-result';

export class GetCurrentUnfinishedUserGameQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetCurrentUnfinishedUserGameQuery)
export class GetCurrentUnfinishedUserGameUseCase
  implements IQueryHandler<GetCurrentUnfinishedUserGameQuery>
{
  constructor(
    private readonly gameTypeormQueryRepository: GameTypeormQueryRepository,
    private readonly playerTypeormQueryRepository: PlayerTypeormQueryRepository,
  ) {}

  async execute(
    query: GetCurrentUnfinishedUserGameQuery,
  ): Promise<Result<Game | null>> {
    const { userId } = query;

    const player: boolean =
      await this.playerTypeormQueryRepository.checkPlayerExistsByUserId(userId);
    // TODO: if !player
    if (!player) {
      return Result.notFound('Player for user does not exists');
    }

    const currentUnfinishedUserGame: Game | null =
      await this.gameTypeormQueryRepository.getCurrentUnfinishedUserGame(
        userId,
      );

    // TODO: if !game
    if (!currentUnfinishedUserGame) {
      return Result.notFound('Player is not in a game');
    }

    return Result.success(currentUnfinishedUserGame);
  }
}
