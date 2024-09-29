import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPostgresRepository } from '../../infrastructure/postgres/blogs-postgres.repository';
import { Result } from '../../../../../base/types/object-result';

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
    private readonly blogsPostgresRepository: BlogsPostgresRepository,
  ) {}

  async execute(command: UpdateBlogCommand) {
    const { id, name, description, websiteUrl } = command;

    const blog = await this.blogsPostgresRepository.findById(command.id);

    if (!blog) {
      return Result.notFound(`Blog with id ${command.id} could not be found`);
    }

    await this.blogsPostgresRepository.update(
      id,
      name,
      description,
      websiteUrl,
    );

    return Result.success();
  }
}
