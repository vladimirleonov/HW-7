import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../core/guards/passport/basic-auth.guard';
import { QuestionCreateModel } from './models/input/create-question.input.model';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/commands/create-question.command';
import { Result } from '../../../base/types/object-result';
import { GetQuestionQuery } from '../application/queries/get-question.query';
import { QuestionOutputModel } from './models/output/question.output.model';

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

    const createResult: Result<number> = await this.commandBus.execute<
      CreateQuestionCommand,
      Result<number>
    >(new CreateQuestionCommand(body, correctAnswers));

    const createdId: number = createResult.data;

    const getResult: Result<QuestionOutputModel | null> =
      await this.queryBus.execute<
        GetQuestionQuery,
        Result<QuestionOutputModel | null>
      >(new GetQuestionQuery(createdId));

    return getResult.data;
  }
}
