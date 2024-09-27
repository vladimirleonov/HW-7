import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPostgresRepository } from '../../infrastructure/postgres/blogs-postgres.repository';
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
    private readonly blogsPostgresRepository: BlogsPostgresRepository,
  ) {}

  async execute(command: CreateBlogCommand) {
    const { name, description, websiteUrl } = command;

    // const newBlog = new this.blogModel({
    //   name: command.name,
    //   description: command.description,
    //   websiteUrl: command.websiteUrl,
    //   createdAt: new Date(),
    //   isMembership: false,
    // });

    // const createdBlog: BlogDocument = await this.blogsRepository.save(newBlog);

    const createdId: number = await this.blogsPostgresRepository.create(
      name,
      description,
      websiteUrl,
      false,
    );

    return Result.success(createdId);
  }
}
