import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { registrationEmailTemplate } from '../../../../../core/email-templates/registration-email-template';
import { CryptoService } from '../../../../../core/application/crypto.service';
import { UsersPostgresRepository } from '../../../../users/infrastructure/postgresql/users-postgres.repository';
import { NodemailerService } from '../../../../../core/application/nodemailer.service';

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
    private readonly usersPostgresRepository: UsersPostgresRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(
    command: RegistrationUserCommand,
  ): Promise<Result<string | null>> {
    const { login, password, email } = command;

    const [userByLogin, userByEmail] = await Promise.all([
      this.usersPostgresRepository.findByLogin(login),
      this.usersPostgresRepository.findByEmail(email),
    ]);

    // const userByLogin = await this.usersPostgresRepository.findByLogin(login);

    if (userByLogin) {
      // return Result.badRequest('User with such credentials already exists');
      return Result.badRequest([
        {
          message: 'User with such credentials already exists',
          field: 'login',
        },
      ]);
    }

    // const userByEmail = await this.usersPostgresRepository.findByEmail(email);

    if (userByEmail) {
      // return Result.badRequest('User with such credentials already exists');
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

    // TODO: correct user with nested schema
    // const newUser: UserDocument = new this.UserModel({
    //   login: login,
    //   password: passwordHash,
    //   email: email,
    //   createdAt: new Date(),
    //   emailConfirmation: {
    //     confirmationCode: randomUUID(),
    //     expirationDate: add(new Date(), {
    //       hours: 1,
    //       minutes: 30,
    //     }),
    //     isConfirmed: false,
    //   },
    //   // TODO: can set default value in schema not to write '' here
    //   passwordRecovery: {
    //     recoveryCode: '',
    //     expirationDate: '',
    //   },
    // });

    const createdUser: any = await this.usersPostgresRepository.create(
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

    // await this.userRepository.save(newUser);

    this.nodemailerService.sendEmail(
      createdUser.email,
      registrationEmailTemplate(createdUser.emailConfirmationConfirmationCode!),
      'Registration Confirmation',
    );

    return Result.success();
  }
}
