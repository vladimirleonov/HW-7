import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../base/types/object-result';
import { UsersPostgresRepository } from '../../infrastructure/postgresql/users-postgresql.repository';

export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersPostgresRepository: UsersPostgresRepository) {}

  async execute(command: DeleteUserCommand) {
    const { id } = command;

    const isDeleted: boolean = await this.usersPostgresRepository.delete(id);

    if (isDeleted) {
      return Result.success();
    } else {
      return Result.notFound(`User with id ${command.id} does not exist`);
    }
  }
}
