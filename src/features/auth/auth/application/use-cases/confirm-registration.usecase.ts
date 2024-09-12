import { UserDocument } from '../../../../users/domain/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';

export class ConfirmRegistrationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(private readonly userRepository: UsersRepository) {}

  async execute(command: ConfirmRegistrationCommand): Promise<any> {
    const { code } = command;

    const existingUser: UserDocument | null =
      await this.userRepository.findUserByConfirmationCode(code);

    if (!existingUser) {
      return Result.badRequest('Invalid confirmation code');
    }

    if (existingUser.emailConfirmation.expirationDate < new Date()) {
      return Result.badRequest('Confirmation code has expired');
    }

    if (existingUser.emailConfirmation.isConfirmed) {
      return Result.badRequest('User account already confirmed');
    }

    existingUser.emailConfirmation.isConfirmed = true;

    await this.userRepository.save(existingUser);

    return Result.success();
  }
}
