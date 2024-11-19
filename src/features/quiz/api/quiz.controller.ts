import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/guards/passport/jwt-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateConnectionCommand } from '../application/commands/create-connection.command';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { GetUserPendingOrJoinedGameQuery } from '../application/queries/get-user-pending-or-joined-game.query';
import { Game } from '../domain/game.entity';

@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz/pairs')
export class QuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('connection')
  async createConnection(@CurrentUserId() userId: number) {
    const result = await this.commandBus.execute<CreateConnectionCommand, any>(
      new CreateConnectionCommand(userId),
    );

    if (result.status === ResultStatus.Success) {
      const playerId: number = result.data;

      const userPendingOrJoinedGame: Result<Game> = await this.queryBus.execute<
        GetUserPendingOrJoinedGameQuery,
        Result<Game>
      >(new GetUserPendingOrJoinedGameQuery(playerId));

      return userPendingOrJoinedGame.data;
    }
  }
}
