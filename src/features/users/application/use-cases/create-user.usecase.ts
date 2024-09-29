import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiSettings } from '../../../../settings/env/api-settings';
import { Result } from '../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/env/configuration';
import { CryptoService } from '../../../../core/application/crypto.service';
import { UsersPostgresRepository } from '../../infrastructure/postgresql/users-postgres.repository';

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
    private readonly usersPostgresRepository: UsersPostgresRepository,
    private cryptoService: CryptoService,
    private configService: ConfigService<ConfigurationType, true>,
  ) {}

  async execute(command: CreateUserCommand) {
    const { login, password, email } = command;

    const apiSettings: ApiSettings = this.configService.get('apiSettings', {
      infer: true,
    });

    const [foundUserByLogin, foundUserByEmail] = await Promise.all([
      this.usersPostgresRepository.findByField('login', login),
      this.usersPostgresRepository.findByField('email', email),
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

    const generatedPasswordHash: string = await this.cryptoService.createHash(
      password,
      apiSettings.HASH_ROUNDS,
    );

    const createdUser: any = await this.usersPostgresRepository.create(
      login,
      generatedPasswordHash,
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

    const userId: string = createdUser.id;

    return Result.success(userId);
  }
}
