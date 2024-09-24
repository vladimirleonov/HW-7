import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { UsersPostgresRepository } from '../../../../users/infrastructure/postgresql/users-postgres.repository';

export class ConfirmRegistrationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(
    private readonly usersPostgresRepository: UsersPostgresRepository,
  ) {}

  async execute(command: ConfirmRegistrationCommand): Promise<any> {
    const { code } = command;

    const existingUser =
      await this.usersPostgresRepository.findUserByConfirmationCode(code);

    if (!existingUser) {
      // return Result.badRequest('Invalid confirmation code');
      return Result.badRequest([
        {
          message: 'Invalid confirmation code',
          field: 'code',
        },
      ]);
    }

    if (existingUser.emailConfirmationExpirationDat < new Date()) {
      // return Result.badRequest('Confirmation code has expired');
      return Result.badRequest([
        {
          message: 'Confirmation code has expired',
          field: 'code',
        },
      ]);
    }

    console.log(
      'existingUser.emailConfirmationIsEmailConfirmed',
      existingUser.emailConfirmationIsEmailConfirmed,
    );

    if (existingUser.emailConfirmationIsEmailConfirmed) {
      // return Result.badRequest('User account already confirmed');
      return Result.badRequest([
        {
          message: 'Email already confirmed',
          field: 'code',
        },
      ]);
    }

    const userId: number = existingUser.id;

    await this.usersPostgresRepository.updateIsConfirmed(true, userId);

    // existingUser.emailConfirmation.isConfirmed = true;

    // await this.usersPostgresRepository.save(existingUser);

    return Result.success();
  }
}
