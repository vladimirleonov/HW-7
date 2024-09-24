import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPostgresRepository } from '../../infrastructure/postgres/blogs-postgres.repository';

export class DeleteBlogCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    private readonly blogsPostgresRepository: BlogsPostgresRepository,
  ) {}

  async execute(command: DeleteBlogCommand): Promise<any> {
    // const isDeleted: boolean = await this.blogsRepository.delete(command.id);
    // if (isDeleted) {
    //   return Result.success();
    // } else {
    //   return Result.notFound(
    //     `Blog with id ${command.id} could not be found or deleted`,
    //   );
    // }
  }
}
