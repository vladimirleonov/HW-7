import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiSettings } from '../../../../settings/env/api-settings';
import { Result } from '../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/env/configuration';
import { CryptoService } from '../../../../core/application/crypto.service';
import { UsersTypeormRepository } from '../../infrastructure/typeorm/users-typeorm.repository';
import { User } from '../../domain/user.entity';

export class CreateUserCommand {
  constructor(
    public readonly login: string,
    public readonly password: string,
    public readonly email: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersTypeormRepository: UsersTypeormRepository,
    private cryptoService: CryptoService,
    private configService: ConfigService<ConfigurationType, true>,
  ) {}

  async execute(command: CreateUserCommand) {
    const { login, password, email } = command;

    const apiSettings: ApiSettings = this.configService.get('apiSettings', {
      infer: true,
    });

    const [foundUserByLogin, foundUserByEmail] = await Promise.all([
      this.usersTypeormRepository.findByField('login', login),
      this.usersTypeormRepository.findByField('email', email),
    ]);

    if (foundUserByLogin) {
      return Result.badRequest([
        {
          message: 'User already exists',
          field: 'login',
        },
      ]);
    }

    if (foundUserByEmail) {
      return Result.badRequest([
        {
          message: 'User already exists',
          field: 'email',
        },
      ]);
    }

    const passwordHash: string = await this.cryptoService.createHash(
      password,
      apiSettings.HASH_ROUNDS,
    );

    const createdUser: User = await this.usersTypeormRepository.create(
      login,
      passwordHash,
      email,
      {
        confirmationCode: randomUUID(),
        expirationDate: new Date(),
        isConfirmed: true,
      },
      {
        recoveryCode: randomUUID(),
        expirationDate: new Date(),
      },
    );

    const userId: number = createdUser.id;

    return Result.success(userId);
  }
}
