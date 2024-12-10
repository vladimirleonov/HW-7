import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../../domain/answer.entity';
import { Repository } from 'typeorm';
import { AnswerOutputModel } from '../../api/models/output/answer.output.model';

export class AnswerTypeormQueryRepository {
  constructor(
    @InjectRepository(Answer)
    private readonly answerQueryRepository: Repository<Answer>,
  ) {}

  async getOne(id: number): Promise<AnswerOutputModel | null> {
    const answer: AnswerOutputModel | undefined =
      await this.answerQueryRepository
        .createQueryBuilder('a')
        .select([
          'CAST(a.questionId as text) as "questionId"',
          'a.status as "answerStatus"',
          'a.createdAt as "addedAt"',
        ])
        .where('a.id = :id', { id: id })
        .getRawOne();

    return answer ?? null;
  }
}
