import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsTypeormRepository } from '../../infrastructure/typeorm/blogs-typeorm.repository';
import { Result } from '../../../../../base/types/object-result';

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

  async execute(command: CreateBlogCommand) {
    const { name, description, websiteUrl } = command;

    const createdId: number = await this.blogsPostgresRepository.create(
      name,
      description,
      websiteUrl,
      false,
    );

    return Result.success(createdId);
  }
}
