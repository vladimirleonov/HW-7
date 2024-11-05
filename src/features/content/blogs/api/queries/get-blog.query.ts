import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Blog } from '../../domain/blog.entity';
import { BlogsTypeormQueryRepository } from '../../infrastructure/typeorm/blogs-typeorm.query-repository';

export class GetBlogQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetBlogQuery)
export class GetBlogUseCase implements IQueryHandler {
  constructor(
    private readonly blogsTypeormQueryRepository: BlogsTypeormQueryRepository,
  ) {}

  execute(query: GetBlogQuery): Promise<Blog | null> {
    const { id } = query;

    return this.blogsTypeormQueryRepository.findById(id);
  }
}
