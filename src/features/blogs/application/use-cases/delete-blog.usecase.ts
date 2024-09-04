import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../base/types/object-result';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class DeleteBlogCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<any> {
    const isDeleted: boolean = await this.blogsRepository.delete(command.id);
    if (isDeleted) {
      return Result.success();
    } else {
      return Result.notFound(
        `Blog with id ${command.id} could not be found or deleted`,
      );
    }
  }
}
