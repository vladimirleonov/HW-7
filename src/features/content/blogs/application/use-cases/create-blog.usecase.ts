import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsTypeormRepository } from '../../infrastructure/typeorm/blogs-typeorm.repository';
import { Result } from '../../../../../base/types/object-result';
import { Blog } from '../../domain/blog.entity';

export class CreateBlogCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly websiteUrl: string,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly blogsPostgresRepository: BlogsTypeormRepository,
  ) {}

  async execute(command: CreateBlogCommand): Promise<Result<number>> {
    const { name, description, websiteUrl } = command;

    const blog: Blog = Blog.create(name, description, websiteUrl, false);

    await this.blogsPostgresRepository.save(blog);

    const blogId: number = blog.id;

    return Result.success(blogId);
  }
}
