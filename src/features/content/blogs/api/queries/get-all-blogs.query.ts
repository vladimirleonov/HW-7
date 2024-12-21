import {
  PaginationOutput,
  PaginationWithSearchNameTerm,
} from '../../../../../base/models/pagination.base.model';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsTypeormQueryRepository } from '../../infrastructure/typeorm/blogs-typeorm.query-repository';
import { Blog } from '../../domain/blog.entity';
import { SearchNameQueryParams } from '../../../../../base/models/pagination-query.input.model';

export class GetAllBlogsQuery {
  constructor(
    public readonly pagination: PaginationWithSearchNameTerm<SearchNameQueryParams>,
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
