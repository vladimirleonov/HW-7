import {
  PaginationOutput,
  PaginationWithSearchNameTerm,
} from '../../../../../base/models/pagination.base.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsTypeormQueryRepository } from '../../infrastructure/typeorm/blogs-typeorm.query-repository';
import { PaginationWithSearchNameTermQuery } from '../../../../../base/models/pagination-query.input.model';
import { Blog } from '../../domain/blog.entity';

export class GetAllBlogsQuery {
  constructor(
    public readonly pagination: PaginationWithSearchNameTerm<PaginationWithSearchNameTermQuery>,
  ) {}
}

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsUseCase implements IQueryHandler<GetAllBlogsQuery> {
  constructor(
    private readonly blogsTypeormQueryRepository: BlogsTypeormQueryRepository,
  ) {}

  async execute(query: GetAllBlogsQuery): Promise<PaginationOutput<Blog>> {
    const { pagination } = query;

    return this.blogsTypeormQueryRepository.getAll(pagination);
  }
}
