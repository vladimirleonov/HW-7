import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/guards/passport/jwt-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateConnectionCommand } from '../application/commands/create-connection.command';
import { ResultStatus } from '../../../base/types/object-result';

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
      // const userActivePair = await this.queryBus.execute();
    }
  }
}
