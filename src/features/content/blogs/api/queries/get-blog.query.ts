import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsTypeormRepository } from '../../infrastructure/typeorm/blogs-typeorm.repository';
import { Blog } from '../../domain/blog.entity';

export class GetBlogQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetBlogQuery)
export class GetBlogUseCase implements IQueryHandler {
  constructor(
    private readonly blogsTypeormQueryRepository: BlogsTypeormRepository,
  ) {}

  execute(query: GetBlogQuery): Promise<Blog | null> {
    const { id } = query;

    return this.blogsTypeormQueryRepository.findById(id);
  }
}
