import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Result } from '../../../../base/types/object-result';

export class DeleteUserCommand {
  constructor(public readonly id: number) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    //private usersPostgresRepository: UsersTypeormRepository
  ) {}

  async execute(command: DeleteUserCommand) {
    const { id } = command;

    const deleteResult: DeleteResult = await this.userRepository.delete(id);

    if (deleteResult.affected) {
      return Result.success();
    } else {
      return Result.notFound(`User with id ${command.id} does not exist`);
    }
  }
}
