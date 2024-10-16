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

    // const user = await this.userRepository.findOne({ where: { id: id } });
    // console.log('user', user);
    // if (!user || user.deletedAt) {
    //   console.log('!user');
    //   return Result.notFound(`User with id ${command.id} does not exist`);
    // }
    //
    // const res: UpdateResult = await this.userRepository.softDelete(command.id);
    // console.log('softDelete res', res);
    // return Result.success();

    const deleteResult: DeleteResult = await this.userRepository.delete(id);
    console.log(deleteResult);

    if (deleteResult.affected) {
      return Result.success();
    } else {
      return Result.notFound(`User with id ${command.id} does not exist`);
    }
  }
}
