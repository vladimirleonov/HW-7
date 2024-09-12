import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand) {
    const isDeleted: boolean = await this.postsRepository.delete(command.id);

    if (isDeleted) {
      return Result.success();
    } else {
      return Result.notFound();
    }
  }
}
