import {
  PaginationOutput,
  PaginationWithBodySearchTermAndPublishedStatus,
} from '../../../../base/models/pagination.base.model';
import { QuestionsPaginationQuery } from '../../api/models/input/questions-pagination-query.input.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionTypeormQueryRepository } from '../../infrastructure/question-typeorm.query-repository';
import { QuestionOutputModel } from '../../api/models/output/question.output.model';
import { Result } from '../../../../base/types/object-result';

export class GetAllQuestionsQuery {
  constructor(
    public readonly pagination: PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery>,
  ) {}
}

@QueryHandler(GetAllQuestionsQuery)
export class GetAllQuestionsUseCase implements IQueryHandler {
  constructor(
    public readonly questionTypeormQueryRepository: QuestionTypeormQueryRepository,
  ) {}

  async execute(
    query: GetAllQuestionsQuery,
  ): Promise<Result<PaginationOutput<QuestionOutputModel>>> {
    const { pagination } = query;

    const result: PaginationOutput<QuestionOutputModel> =
      await this.questionTypeormQueryRepository.getAll(pagination);

    return Result.success(result);
  }
}
