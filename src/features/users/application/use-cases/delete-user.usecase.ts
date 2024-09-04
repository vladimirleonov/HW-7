import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../base/types/object-result';
import { UsersRepository } from '../../infrastructure/users.repository';

export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand) {
    const isDeleted: boolean = await this.usersRepository.delete(command.id);

    if (isDeleted) {
      return Result.success();
    } else {
      return Result.notFound(`User with id ${command.id} does not exist`);
    }
  }
}
