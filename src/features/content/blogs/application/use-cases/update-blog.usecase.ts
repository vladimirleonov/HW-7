import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsTypeormRepository } from '../../infrastructure/typeorm/blogs-typeorm.repository';
import { Result } from '../../../../../base/types/object-result';
import { Blog } from '../../domain/blog.entity';

export class UpdateBlogCommand {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly websiteUrl: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private readonly blogsTypeormRepository: BlogsTypeormRepository,
  ) {}

  async execute(command: UpdateBlogCommand) {
    const { id, name, description, websiteUrl } = command;

    const blog: Blog | null = await this.blogsTypeormRepository.findById(
      command.id,
    );

    if (!blog) {
      return Result.notFound(`Blog with id ${command.id} could not be found`);
    }

    await this.blogsTypeormRepository.update(id, name, description, websiteUrl);

    return Result.success();
  }
}
