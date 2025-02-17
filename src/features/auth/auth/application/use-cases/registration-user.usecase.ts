import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { registrationEmailTemplate } from '../../../../../core/email-templates/registration-email-template';
import { CryptoService } from '../../../../../core/application/crypto.service';
import { UsersTypeormRepository } from '../../../../users/infrastructure/typeorm/users-typeorm.repository';
import { NodemailerService } from '../../../../../core/application/nodemailer.service';
import { User } from '../../../../users/domain/user.entity';

export class RegistrationUserCommand {
  constructor(
    public readonly login: string,
    public readonly password: string,
    public readonly email: string,
  ) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly usersTypeormRepository: UsersTypeormRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(
    command: RegistrationUserCommand,
  ): Promise<Result<string | null>> {
    const { login, password, email } = command;

    const [userByLogin, userByEmail] = await Promise.all([
      this.usersTypeormRepository.findByLogin(login),
      this.usersTypeormRepository.findByEmail(email),
    ]);

    if (userByLogin) {
      return Result.badRequest([
        {
          message: 'User with such credentials already exists',
          field: 'login',
        },
      ]);
    }

    if (userByEmail) {
      return Result.badRequest([
        {
          message: 'User with such credentials already exists',
          field: 'email',
        },
      ]);
    }

    const saltRounds: number = 10;
    const passwordHash: string = await this.cryptoService.createHash(
      password,
      saltRounds,
    );

    const confirmationCode: string = randomUUID();

    const createdUser: User = await this.usersTypeormRepository.create(
      login,
      passwordHash,
      email,
      {
        confirmationCode: confirmationCode,
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 30,
        }),
        isConfirmed: false,
      },
      {
        recoveryCode: randomUUID(),
        expirationDate: new Date(),
      },
    );

    this.nodemailerService.sendEmail(
      createdUser.email,
      registrationEmailTemplate(confirmationCode),
      'Registration Confirmation',
    );

    return Result.success();
  }
}
