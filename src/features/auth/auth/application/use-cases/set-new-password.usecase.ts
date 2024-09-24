import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { UsersPostgresRepository } from '../../../../users/infrastructure/postgresql/users-postgres.repository';
import { CryptoService } from '../../../../../core/application/crypto.service';
import { randomUUID } from 'node:crypto';

export class SetNewPasswordCommand {
  constructor(
    public readonly newPassword: string,
    public readonly recoveryCode: string,
  ) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase
  implements ICommandHandler<SetNewPasswordCommand>
{
  constructor(
    private readonly usersPostgresRepository: UsersPostgresRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute(command: SetNewPasswordCommand): Promise<Result> {
    const { newPassword, recoveryCode } = command;

    //console.log(newPassword, recoveryCode);

    const user =
      await this.usersPostgresRepository.findUserByRecoveryCode(recoveryCode);

    //console.log('rec', user);

    if (!user) {
      // return Result.badRequest('Incorrect recovery code');
      return Result.badRequest([
        {
          message: 'Incorrect recovery code',
          field: 'recoveryCode',
        },
      ]);
    }

    const currentDate: Date = new Date();
    const expirationDate: Date = user.passwordRecoveryExpirationDate;

    // console.log('currentDate', currentDate);
    // console.log('expirationDate', expirationDate);

    if (expirationDate < currentDate) {
      // return Result.badRequest('Recovery code has expired');
      return Result.badRequest([
        {
          message: 'Recovery code has expired',
          field: 'recoveryCode',
        },
      ]);
    }

    const saltRounds: number = 10;
    const passwordHash: string = await this.cryptoService.createHash(
      newPassword,
      saltRounds,
    );

    // user.password = passwordHash;
    // user.passwordRecovery.recoveryCode = ''; // set '' after successful update
    // user.passwordRecovery.expirationDate = new Date(); // set current date after successful update

    const userId: number = user.id;

    // console.log('pass-to');
    await this.usersPostgresRepository.updateUserPasswordHashRecoveryCodeAndExpirationDate(
      passwordHash,
      randomUUID(),
      new Date(),
      userId,
    );
    // await this.usersPostgresRepository.save(user);

    return Result.success();
  }
}
