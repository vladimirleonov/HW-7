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

    const createdUser: any = await this.usersTypeormRepository.create(
      login,
      passwordHash,
      email,
      {
        confirmationCode: randomUUID(),
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

    // TODO: ask how to improve below code
    const createdUserWithRelations: User | null =
      await this.usersTypeormRepository.findById(createdUser.id);

    if (!createdUserWithRelations) {
      return Result.internalError();
    }

    this.nodemailerService.sendEmail(
      createdUser.email,
      registrationEmailTemplate(
        createdUserWithRelations.emailConfirmation.confirmationCode,
      ),
      'Registration Confirmation',
    );

    return Result.success();
  }
}
