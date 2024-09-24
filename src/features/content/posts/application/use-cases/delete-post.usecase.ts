import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPostgresRepository } from '../../infrastructure/postgres/posts-postgres.repository';

export class DeletePostCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly postsPostgresRepository: PostsPostgresRepository,
  ) {}

  async execute(command: DeletePostCommand) {
    // const isDeleted: boolean = await this.postsRepository.delete(command.id);
    //
    // if (isDeleted) {
    //   return Result.success();
    // } else {
    //   return Result.notFound();
    // }
  }
}
