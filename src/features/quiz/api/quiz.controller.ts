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
import { Game } from '../domain/game.entity';
import { GetCurrentUnfinishedUserGameQuery } from '../application/queries/get-current-unfinished-user-game.query';
import {
  ForbiddenException,
  NotFoundException,
} from '../../../core/exception-filters/http-exception-filter';
import { GetGameQuery } from '../application/queries/get-game.query';
import { AnswerCreateModel } from './models/input/create-answer.input.model';
import { CreateAnswerCommand } from '../application/commands/create-answer.command';
import { GetAnswerQuery } from '../application/queries/get-answer.query';
import { AnswerOutputModel } from './models/output/answer.output.model';

@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz/pairs')
export class QuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('my-current')
  async getCurrentUnfinishedUserGame(@CurrentUserId() userId: number) {
    const result: Result = await this.queryBus.execute<
      GetCurrentUnfinishedUserGameQuery,
      Result
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
    const result: Result = await this.queryBus.execute<GetGameQuery, Result>(
      new GetGameQuery(id, userId),
    );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    } else if (result.status === ResultStatus.Forbidden) {
      throw new ForbiddenException();
    } else if (result.status === ResultStatus.Success) {
      return result.data;
    }
  }

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async createConnection(@CurrentUserId() userId: number) {
    const result = await this.commandBus.execute<CreateConnectionCommand, any>(
      new CreateConnectionCommand(userId),
    );

    if (result.status === ResultStatus.Forbidden) {
      throw new ForbiddenException();
    }

    if (result.status === ResultStatus.Success) {
      const playerId: number = result.data;

      const userPendingOrJoinedGame: Result<Game> = await this.queryBus.execute<
        GetPendingOrJoinedUserGameQuery,
        Result<Game>
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

    const createResult: Result<number> = await this.commandBus.execute<
      CreateAnswerCommand,
      Result<number>
    >(new CreateAnswerCommand(userId, answer));

    if (createResult.status === ResultStatus.Forbidden) {
      throw new ForbiddenException();
    }

    const answerId: number = createResult.data;

    const getResult: Result<AnswerOutputModel> = await this.queryBus.execute<
      GetAnswerQuery,
      Result<AnswerOutputModel>
    >(new GetAnswerQuery(answerId));

    return getResult.data;
  }
}
