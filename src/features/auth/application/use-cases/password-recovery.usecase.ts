import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../../users/domain/user.entity';
import { Result } from '../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { passwordRecoveryEmailTemplate } from '../../../../core/email-templates/password-recovery-email-template';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { NodemailerService } from '../../../../core/application/nodemailer.service';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    public readonly userRepository: UsersRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<any> {
    const { email } = command;

    const existingUser: UserDocument | null =
      await this.userRepository.findByEmail(email);

    if (!existingUser) {
      return Result.notFound(`User with email ${email} does not exist`);
    }

    const recoveryCode: string = randomUUID();
    const expirationDate: Date = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    existingUser.passwordRecovery.recoveryCode = recoveryCode;
    existingUser.passwordRecovery.expirationDate = expirationDate;

    await this.userRepository.save(existingUser);

    this.nodemailerService.sendEmail(
      email,
      passwordRecoveryEmailTemplate(recoveryCode),
      'Password Recovery',
    );

    await this.userRepository.save(existingUser);

    return Result.success();
  }
}
