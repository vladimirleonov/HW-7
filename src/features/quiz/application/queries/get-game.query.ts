import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result } from '../../../../base/types/object-result';
import { GameTypeormQueryRepository } from '../../infrastructure/game/game-typeorm.query-repository';
import { GameOutputModel } from '../../api/models/output/game.output.model';

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

  async execute(query: GetGameQuery): Promise<Result<GameOutputModel | null>> {
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

    const game: GameOutputModel | null =
      await this.gameTypeormQueryRepository.getOne(gameId);

    if (!game) {
      return Result.notFound();
    }

    return Result.success(game);
  }
}
