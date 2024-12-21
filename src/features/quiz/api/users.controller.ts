import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/guards/passport/jwt-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { QueryBus } from '@nestjs/cqrs';
import { Result } from '../../../base/types/object-result';
import {
  Pagination,
  PaginationOutput,
  PaginationWithScores,
} from '../../../base/models/pagination.base.model';
import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import { UserStatisticOutputModel } from './models/output/my-statistic.output.model';
import { GetMyStatisticQuery } from '../application/queries/get-my-statistic.query';
import { TopUserOutputModel } from './models/output/top-user.output.model';
import { GetTopUsersQuery } from '../application/queries/get-top-users.query';
import { MultiSortQueryParams } from '../../../base/models/pagination-query.input.model';

export const TOP_USERS_SORTING_PROPERTIES: SortingPropertiesType<TopUserOutputModel> =
  ['avgScores', 'sumScore', 'winsCount', 'lossesCount'];

@Controller('pair-game-quiz/users')
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('top')
  async topUsers(@Param() query: MultiSortQueryParams) {
    const pagination: PaginationWithScores<MultiSortQueryParams> =
      new Pagination(query, TOP_USERS_SORTING_PROPERTIES);

    const result: Result<PaginationOutput<TopUserOutputModel>> =
      await this.queryBus.execute<
        GetTopUsersQuery,
        Result<PaginationOutput<TopUserOutputModel>>
      >(new GetTopUsersQuery(pagination));

    return result.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/my-statistic')
  async myStatistic(@CurrentUserId() userId: number) {
    const result: Result<UserStatisticOutputModel> =
      await this.queryBus.execute<
        GetMyStatisticQuery,
        Result<UserStatisticOutputModel>
      >(new GetMyStatisticQuery(userId));

    return result.data;
  }
}
