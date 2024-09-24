import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPostgresRepository } from '../../infrastructure/postgres/blogs-postgres.repository';

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
    // const newBlog: BlogDocument = new this.blogModel({
    //   name: command.name,
    //   description: command.description,
    //   websiteUrl: command.websiteUrl,
    //   createdAt: new Date(),
    //   isMembership: false,
    // });
    //
    // const createdBlog: BlogDocument = await this.blogsRepository.save(newBlog);
    //
    // return Result.success(createdBlog.id);
  }
}
