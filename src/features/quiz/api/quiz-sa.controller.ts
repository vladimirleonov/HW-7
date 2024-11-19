import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../core/guards/passport/basic-auth.guard';
import { QuestionCreateModel } from './models/input/create-question.input.model';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/commands/create-question.command';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { GetQuestionQuery } from '../application/queries/get-question.query';
import { QuestionOutputModel } from './models/output/question.output.model';
import { DeleteQuestionCommand } from '../application/commands/delete-question.command';
import { NotFoundException } from '../../../core/exception-filters/http-exception-filter';
import { QuestionUpdateModel } from './models/input/update-question.input.model';
import { UpdateQuestionCommand } from '../application/commands/update-question.command';
import { PublishedStatusUpdateModel } from './models/input/update-published-status.input.model';
import { UpdatePublishedStatusCommand } from '../application/commands/update-published-status.command';
import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import { QuestionsPaginationQuery } from './models/input/questions-pagination-query.input.model';
import {
  PaginationOutput,
  PaginationWithBodySearchTermAndPublishedStatus,
} from '../../../base/models/pagination.base.model';
import { GetAllQuestionsQuery } from '../application/queries/get-all-questions.query';

export const QUESTIONS_SORTING_PROPERTIES: SortingPropertiesType<QuestionOutputModel> =
  ['body'];

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class QuizSaController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getAll(@Query() query: QuestionsPaginationQuery) {
    const pagination: PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery> =
      new PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery>(
        query,
        QUESTIONS_SORTING_PROPERTIES,
      );

    const result: Result<PaginationOutput<QuestionOutputModel>> =
      await this.queryBus.execute<
        GetAllQuestionsQuery,
        Result<PaginationOutput<QuestionOutputModel>>
      >(new GetAllQuestionsQuery(pagination));

    return result.data;
  }

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
    const { body, correctAnswers } = updateModel;

    const result: Result = await this.queryBus.execute<
      UpdateQuestionCommand,
      Result
    >(new UpdateQuestionCommand(id, body, correctAnswers));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    }
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePublishedStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() publishedStatusUpdateModel: PublishedStatusUpdateModel,
  ) {
    const { published } = publishedStatusUpdateModel;

    const result: Result = await this.commandBus.execute<
      UpdatePublishedStatusCommand,
      Result
    >(new UpdatePublishedStatusCommand(id, published));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException();
    }
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
