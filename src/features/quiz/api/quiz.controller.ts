import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/guards/passport/jwt-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateConnectionCommand } from '../application/commands/create-connection.command';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { GetPendingOrJoinedUserGameQuery } from '../application/queries/get-pending-or-joined-user-game.query';
import { GetCurrentUnfinishedUserGameQuery } from '../application/queries/get-current-unfinished-user-game.query';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '../../../core/exception-filters/http-exception-filter';
import { GetGameQuery } from '../application/queries/get-game.query';
import { AnswerCreateModel } from './models/input/create-answer.input.model';
import { CreateAnswerCommand } from '../application/commands/create-answer.command';
import { GetAnswerQuery } from '../application/queries/get-answer.query';
import { AnswerOutputModel } from './models/output/answer.output.model';
import { GameOutputModel } from './models/output/game.output.model';
import { myGamesPaginationQuery } from './models/input/my-games-pagination-query.input.model';
import {
  GamePagination,
  PaginationOutput,
} from '../../../base/models/pagination.base.model';
import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import { GetAllUserGamesQuery } from '../application/queries/get-all-user-games.query';
import { GamePaginationQuery } from './models/input/game-pagination-query.input.model';
import { UserStatisticOutputModel } from './models/output/my-statistic.output.model';
import { GetMyStatisticQuery } from '../application/queries/get-my-statistic.query';

export const GAME_SORTING_PROPERTIES: SortingPropertiesType<GameOutputModel> = [
  'status',
  'pairCreatedDate',
  'startGameDate',
  'finishGameDate',
];

@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz/pairs')
export class QuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('my')
  async getAllMyGames(
    @Param() query: myGamesPaginationQuery,
    @CurrentUserId() userId: number,
  ) {
    const pagination: GamePagination<GamePaginationQuery> = new GamePagination(
      query,
      GAME_SORTING_PROPERTIES,
    );

    const result: PaginationOutput<GameOutputModel> =
      await this.queryBus.execute<
        GetAllUserGamesQuery,
        PaginationOutput<GameOutputModel>
      >(new GetAllUserGamesQuery(pagination, userId));

    return result;
  }

  @Get('my-statistic')
  async myStatistic(@CurrentUserId() userId: number) {
    const result: Result<UserStatisticOutputModel> =
      await this.queryBus.execute<
        GetMyStatisticQuery,
        Result<UserStatisticOutputModel>
      >(new GetMyStatisticQuery(userId));

    return result.data;
  }

  @Get('my-current')
  async getCurrentUnfinishedUserGame(@CurrentUserId() userId: number) {
    const result: Result<GameOutputModel | null> = await this.queryBus.execute<
      GetCurrentUnfinishedUserGameQuery,
      Result<GameOutputModel>
    >(new GetCurrentUnfinishedUserGameQuery(userId));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    }

    return result.data;
  }

  @Get(':id')
  async getGameById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    const result: Result<GameOutputModel | null> = await this.queryBus.execute<
      GetGameQuery,
      Result<GameOutputModel>
    >(new GetGameQuery(id, userId));

    switch (result.status) {
      case ResultStatus.NotFound:
        throw new NotFoundException();
      case ResultStatus.Forbidden:
        throw new ForbiddenException();
      case ResultStatus.Success:
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async createConnection(@CurrentUserId() userId: number) {
    const result: Result<number | null> = await this.commandBus.execute<
      CreateConnectionCommand,
      Result<number | null>
    >(new CreateConnectionCommand(userId));

    if (result.status === ResultStatus.Forbidden) {
      throw new ForbiddenException();
    }

    if (result.status === ResultStatus.Success) {
      if (!result.data) {
        throw new InternalServerErrorException();
      }

      const playerId: number = result.data;

      const userPendingOrJoinedGame: Result<GameOutputModel> =
        await this.queryBus.execute<
          GetPendingOrJoinedUserGameQuery,
          Result<GameOutputModel>
        >(new GetPendingOrJoinedUserGameQuery(playerId));

      return userPendingOrJoinedGame.data;
    }
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  async createAnswer(
    @CurrentUserId() userId: number,
    @Body() answerCreateModel: AnswerCreateModel,
  ) {
    const { answer } = answerCreateModel;

    const createResult: Result<number | null> = await this.commandBus.execute<
      CreateAnswerCommand,
      Result<number | null>
    >(new CreateAnswerCommand(userId, answer));

    if (createResult.status === ResultStatus.Forbidden) {
      throw new ForbiddenException();
    }

    if (!createResult.data) {
      throw new InternalServerErrorException();
    }

    const answerId: number = createResult.data;

    const getResult: Result<AnswerOutputModel> = await this.queryBus.execute<
      GetAnswerQuery,
      Result<AnswerOutputModel>
    >(new GetAnswerQuery(answerId));

    return getResult.data;
  }
}
