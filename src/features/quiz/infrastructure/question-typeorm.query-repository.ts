import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/question.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { QuestionOutputModel } from '../api/models/output/question.output.model';

export class QuestionTypeormQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionQueryRepository: Repository<Question>,
  ) {}

  async getOne(id: number): Promise<QuestionOutputModel | null> {
    const result = this.questionQueryRepository
      .createQueryBuilder('q')
      .select([
        'CAST(q.id as text) as id',
        'q.body as body',
        'q.correctAnswers as "correctAnswers"',
        'q.published as published',
        'q.createdAt as "createdAt"',
        'q.updatedAt as "updatedAt"',
      ])
      .where('q.id = :id', { id })
      .getRawOne();

    return result ?? null;
  }
}
