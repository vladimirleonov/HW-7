import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsTypeormRepository } from '../../infrastructure/typeorm/blogs-typeorm.repository';
import { Result } from '../../../../../base/types/object-result';

export class DeleteBlogCommand {
  constructor(public readonly id: number) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    private readonly blogsTypeormRepository: BlogsTypeormRepository,
  ) {}

  async execute(command: DeleteBlogCommand): Promise<Result> {
    const isDeleted: boolean = await this.blogsTypeormRepository.delete(
      command.id,
    );
    if (isDeleted) {
      return Result.success();
    } else {
      return Result.notFound(
        `Blog with id ${command.id} could not be found or deleted`,
      );
    }
  }
}
