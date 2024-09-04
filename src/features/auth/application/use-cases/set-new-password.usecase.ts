import { ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../base/types/object-result';
import { UserDocument } from '../../../users/domain/user.entity';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CryptoService } from '../../../../core/application/crypto.service';

export class SetNewPasswordCommand {
  constructor(
    public readonly newPassword: string,
    public readonly recoveryCode: string,
  ) {}
}

export class SetNewPasswordUseCase
  implements ICommandHandler<SetNewPasswordCommand>
{
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute(command: SetNewPasswordCommand): Promise<Result> {
    const { newPassword, recoveryCode } = command;

    const user: UserDocument | null =
      await this.userRepository.findUserByRecoveryCode(recoveryCode);

    if (!user) {
      return Result.badRequest('Incorrect recovery code');
    }

    const currentDate: Date = new Date();
    const expirationDate: Date = user.passwordRecovery.expirationDate;

    if (expirationDate < currentDate) {
      return Result.badRequest('Recovery code has expired');
    }

    const saltRounds: number = 10;
    const passwordHash: string = await this.cryptoService.createHash(
      newPassword,
      saltRounds,
    );

    user.password = passwordHash;
    user.passwordRecovery.recoveryCode = ''; // set '' after successful update
    user.passwordRecovery.expirationDate = new Date(); // set current date after successful update

    await this.userRepository.save(user);

    return Result.success();
  }
}
