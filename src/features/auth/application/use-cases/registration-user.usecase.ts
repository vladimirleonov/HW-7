import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../../users/domain/user.entity';
import { Result } from '../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { registrationEmailTemplate } from '../../../../core/email-templates/registration-email-template';
import { CryptoService } from '../../../../core/application/crypto.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { NodemailerService } from '../../../../core/application/nodemailer.service';

export class RegistrationUserCommand {
  constructor(
    public readonly login: string,
    public readonly password: string,
    public readonly email: string,
  ) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly userRepository: UsersRepository,
    @InjectModel(User.name) private readonly UserModel: UserModelType,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(
    command: RegistrationUserCommand,
  ): Promise<Result<string | null>> {
    const { login, password, email } = command;

    const userByEmail: UserDocument | null =
      await this.userRepository.findByEmail(email);

    if (userByEmail) {
      return Result.badRequest('User with such credentials already exists');
    }

    const userByLogin: UserDocument | null =
      await this.userRepository.findByLogin(login);

    if (userByLogin) {
      return Result.badRequest('User with such credentials already exists');
    }

    const saltRounds: number = 10;
    const passwordHash: string = await this.cryptoService.createHash(
      password,
      saltRounds,
    );

    // TODO: correct user with nested schema
    const newUser: UserDocument = new this.UserModel({
      login: login,
      password: passwordHash,
      email: email,
      createdAt: new Date(),
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 30,
        }),
        isConfirmed: false,
      },
      // TODO: can set default value in schema not to write '' here
      passwordRecovery: {
        recoveryCode: '',
        expirationDate: '',
      },
    });

    await this.userRepository.save(newUser);

    this.nodemailerService.sendEmail(
      newUser.email,
      registrationEmailTemplate(newUser.emailConfirmation.confirmationCode!),
      'Registration Confirmation',
    );

    return Result.success();
  }
}
