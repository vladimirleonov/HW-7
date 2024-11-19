import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/guards/passport/jwt-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateConnectionCommand } from '../application/commands/create-connection.command';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { GetPendingOrJoinedUserGameQuery } from '../application/queries/get-pending-or-joined-user-game.query';
import { Game } from '../domain/game.entity';
import { GetCurrentUnfinishedUserGameQuery } from '../application/queries/get-current-unfinished-user-game.query';
import { NotFoundException } from '../../../core/exception-filters/http-exception-filter';

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

  @Post('connection')
  async createConnection(@CurrentUserId() userId: number) {
    const result = await this.commandBus.execute<CreateConnectionCommand, any>(
      new CreateConnectionCommand(userId),
    );

    if (result.status === ResultStatus.Success) {
      const playerId: number = result.data;

      const userPendingOrJoinedGame: Result<Game> = await this.queryBus.execute<
        GetPendingOrJoinedUserGameQuery,
        Result<Game>
      >(new GetPendingOrJoinedUserGameQuery(playerId));

      return userPendingOrJoinedGame.data;
    }
  }
}
