import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/question.entity';
import { Repository } from 'typeorm';
import { QuestionOutputModel } from '../../api/models/output/question.output.model';
import {
  PaginationOutput,
  PaginationWithBodySearchTermAndPublishedStatus,
} from '../../../../base/models/pagination.base.model';
import { PublishedStatus } from '../../../../base/types/published-status';
import { SearchBodyAndPublishedStatusQueryParams } from '../../../../base/models/pagination-query.input.model';

export class QuestionTypeormQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionQueryRepository: Repository<Question>,
  ) {}

  async getAll(
    pagination: PaginationWithBodySearchTermAndPublishedStatus<SearchBodyAndPublishedStatusQueryParams>,
  ): Promise<PaginationOutput<QuestionOutputModel>> {
    const query = this.questionQueryRepository
      .createQueryBuilder('q')
      .select([
        'CAST(q.id as text) as id',
        'q.body as body',
        'q.correctAnswers as "correctAnswers"',
        'q.published as published',
        'q.createdAt as "createdAt"',
        'q.updatedAt as "updatedAt"',
      ])
      //.orderBy(`q.${pagination.sortBy}`, pagination.sortDirection)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize);

    for (const sortItem of pagination.sort) {
      query.addOrderBy(`g.${sortItem.field}`, sortItem.direction);
    }

    if (pagination.publishedStatus !== PublishedStatus.ALL) {
      query.where('q.published = :publishedStatus', {
        publishedStatus:
          pagination.publishedStatus === PublishedStatus.PUBLISHED,
      });
    }

    if (pagination.bodySearchTerm) {
      query.andWhere('q.body ILIKE :bodySearchTerm', {
        bodySearchTerm: `%${pagination.bodySearchTerm}%`,
      });
    }

    const questions: QuestionOutputModel[] = await query.getRawMany();

    const totalCount: number = await query.getCount();

    return new PaginationOutput<QuestionOutputModel>(
      questions,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

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
