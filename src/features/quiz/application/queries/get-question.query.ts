import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionOutputModel } from '../../api/models/output/question.output.model';
import { QuestionTypeormQueryRepository } from '../../infrastructure/question/question-typeorm.query-repository';
import { Result } from '../../../../base/types/object-result';

export class GetQuestionQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetQuestionQuery)
export class GetQuestionUseCase implements IQueryHandler<GetQuestionQuery> {
  constructor(
    private readonly questionTypeormQueryRepository: QuestionTypeormQueryRepository,
  ) {}

  async execute(
    query: GetQuestionQuery,
  ): Promise<Result<QuestionOutputModel | null>> {
    const { id } = query;

    const question: QuestionOutputModel | null =
      await this.questionTypeormQueryRepository.getOne(id);

    return Result.success(question);
  }
}
