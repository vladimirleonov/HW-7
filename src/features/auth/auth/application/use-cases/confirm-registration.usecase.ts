import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { UsersTypeormRepository } from '../../../../users/infrastructure/typeorm/users-typeorm.repository';

export class ConfirmRegistrationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(
    private readonly usersTypeormRepository: UsersTypeormRepository,
  ) {}

  async execute(command: ConfirmRegistrationCommand): Promise<any> {
    const { code } = command;

    const existingUser =
      await this.usersTypeormRepository.findUserByConfirmationCode(code);

    if (!existingUser) {
      return Result.badRequest([
        {
          message: 'Invalid confirmation code',
          field: 'code',
        },
      ]);
    }

    if (existingUser.emailConfirmationExpirationDat < new Date()) {
      return Result.badRequest([
        {
          message: 'Confirmation code has expired',
          field: 'code',
        },
      ]);
    }

    if (existingUser.emailConfirmationIsEmailConfirmed) {
      return Result.badRequest([
        {
          message: 'Email already confirmed',
          field: 'code',
        },
      ]);
    }

    const userId: number = existingUser.id;

    await this.usersTypeormRepository.updateIsConfirmed(true, userId);

    return Result.success();
  }
}
