import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { passwordRecoveryEmailTemplate } from '../../../../../core/email-templates/password-recovery-email-template';
import { UsersPostgresRepository } from '../../../../users/infrastructure/postgresql/users-postgres.repository';
import { NodemailerService } from '../../../../../core/application/nodemailer.service';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    public readonly usersPostgresRepository: UsersPostgresRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<Result> {
    const { email } = command;

    const existingUser = await this.usersPostgresRepository.findByEmail(email);
    // console.log('existingUser', existingUser);
    if (!existingUser) {
      return Result.notFound(`User with email ${email} does not exist`);
    }

    const recoveryCode: string = randomUUID();
    const expirationDate: Date = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    // console.log('expirationDate', expirationDate);

    await this.usersPostgresRepository.updatePasswordRecoveryData(
      recoveryCode,
      expirationDate,
      existingUser.id,
    );

    // existingUser.passwordRecovery.recoveryCode = recoveryCode;
    // existingUser.passwordRecovery.expirationDate = expirationDate;

    //await this.usersPostgresRepository.save(existingUser);

    this.nodemailerService.sendEmail(
      email,
      passwordRecoveryEmailTemplate(recoveryCode),
      'Password Recovery',
    );

    return Result.success();
  }
}
