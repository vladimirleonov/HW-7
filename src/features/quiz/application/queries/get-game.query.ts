import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result } from '../../../../base/types/object-result';
import { Game } from '../../domain/game.entity';
import { GameTypeormQueryRepository } from '../../infrastructure/game-typeorm.query-repository';

export class GetGameQuery {
  constructor(
    public readonly gameId: number,
    public readonly userId: number,
  ) {}
}

@QueryHandler(GetGameQuery)
export class GetGameUseCase implements IQueryHandler<GetGameQuery> {
  constructor(
    private readonly gameTypeormQueryRepository: GameTypeormQueryRepository,
  ) {}

  async execute(query: GetGameQuery): Promise<Result<Game>> {
    const { gameId, userId } = query;

    const gameExists: boolean =
      await this.gameTypeormQueryRepository.gameExists(gameId);
    if (!gameExists) {
      return Result.notFound();
    }

    const isParticipant: boolean =
      await this.gameTypeormQueryRepository.checkUserParticipation(
        gameId,
        userId,
      );
    if (!isParticipant) {
      return Result.forbidden();
    }

    const game: Game | null =
      await this.gameTypeormQueryRepository.getOne(gameId);

    // TODO: not have logic (above the same)
    if (!game) {
      return Result.notFound();
    }

    return Result.success(game);
  }
}
