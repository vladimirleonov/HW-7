import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PlayerTypeormQueryRepository } from '../../infrastructure/player/player-typeorm.query-repository';
import { UserStatisticOutputModel } from '../../api/models/output/my-statistic.output.model';
import { Result } from '../../../../base/types/object-result';

export class GetMyStatisticQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetMyStatisticQuery)
export class GetMyStatisticUseCase
  implements IQueryHandler<GetMyStatisticQuery>
{
  constructor(
    private readonly playerTypeormQueryRepository: PlayerTypeormQueryRepository,
  ) {}

  async execute(
    query: GetMyStatisticQuery,
  ): Promise<Result<UserStatisticOutputModel>> {
    const { userId } = query;

    const result: UserStatisticOutputModel =
      await this.playerTypeormQueryRepository.getMyStatistic(userId);

    return Result.success(result);
  }
}
