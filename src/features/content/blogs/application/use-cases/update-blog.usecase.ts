import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPostgresRepository } from '../../infrastructure/postgres/blogs-postgres.repository';

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
  constructor(
    private readonly blogsPostgresRepository: BlogsPostgresRepository,
  ) {}

  async execute(command: UpdateBlogCommand) {
    // const blog: BlogDocument | null = await this.blogsRepository.findById(
    //   command.id,
    // );
    //
    // if (!blog) {
    //   return Result.notFound(`Blog with id ${command.id} could not be found`);
    // }
    //
    // blog.name = command.name;
    // blog.description = command.description;
    // blog.websiteUrl = command.websiteUrl;
    //
    // await this.blogsRepository.save(blog);
    //
    // return Result.success();
  }
}
