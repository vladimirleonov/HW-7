import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../core/guards/passport/basic-auth.guard';
import { QuestionCreateModel } from './models/input/create-question.input.model';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/use-cases/create-question.usecase';
import { Result } from '../../../base/types/object-result';

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz')
export class QuizSaController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @Post()
  async create(@Body() questionCreateModel: QuestionCreateModel) {
    const { body, correctAnswers } = questionCreateModel;

    const result: Result<number> = await this.commandBus.execute<
      CreateQuestionCommand,
      Result<number>
    >(new CreateQuestionCommand(body, correctAnswers));

    console.log('result', result);

    return 'create quiz';
  }
}
