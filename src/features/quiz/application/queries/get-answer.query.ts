import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result } from '../../../../base/types/object-result';
import { AnswerOutputModel } from '../../api/models/output/answer.output.model';
import { AnswerTypeormQueryRepository } from '../../infrastructure/answer-typeorm.query-repository';

export class GetAnswerQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetAnswerQuery)
export class GetAnswerUseCase implements IQueryHandler<GetAnswerQuery> {
  constructor(
    private readonly answerTypeormQueryRepository: AnswerTypeormQueryRepository,
  ) {}

  async execute(query: GetAnswerQuery) {
    const { id } = query;

    const answer: AnswerOutputModel =
      await this.answerTypeormQueryRepository.getOne(id);

    return Result.success(answer);
  }
}
