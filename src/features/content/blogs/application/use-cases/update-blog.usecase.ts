import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogDocument } from '../../domain/blog.entity';
import { Result } from '../../../../../base/types/object-result';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly websiteUrl: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand) {
    const blog: BlogDocument | null = await this.blogsRepository.findById(
      command.id,
    );

    if (!blog) {
      return Result.notFound(`Blog with id ${command.id} could not be found`);
    }

    blog.name = command.name;
    blog.description = command.description;
    blog.websiteUrl = command.websiteUrl;

    await this.blogsRepository.save(blog);

    return Result.success();
  }
}
