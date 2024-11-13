import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../core/guards/passport/basic-auth.guard';
import { QuestionCreateModel } from './models/input/create-question.input.model';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/commands/create-question.command';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { GetQuestionQuery } from '../application/queries/get-question.query';
import { QuestionOutputModel } from './models/output/question.output.model';
import { async } from 'rxjs';
import { DeleteQuestionCommand } from '../application/commands/delete-question.command';
import { NotFoundException } from '../../../core/exception-filters/http-exception-filter';
import { QuestionUpdateModel } from './models/input/update-question.input.model';

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
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

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModel: QuestionUpdateModel,
  ) {
    const result: Result = await this.queryBus.execute();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result: Result = await this.commandBus.execute<
      DeleteQuestionCommand,
      Result
    >(new DeleteQuestionCommand(id));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    }
  }
}
