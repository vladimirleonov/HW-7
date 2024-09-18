import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiSettings } from '../../../../settings/env/api-settings';
import { User } from '../../domain/user.entity';
import { Result } from '../../../../base/types/object-result';
// import { UsersMongoRepository } from '../../infrastructure/mongo/users-mongo.repository';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/env/configuration';
import { CryptoService } from '../../../../core/application/crypto.service';
import { UsersPostgresqlRepository } from '../../infrastructure/postgresql/users-postgresql.repository';

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
    //@InjectModel(User.name) private userModel: Model<User>,
    // private readonly usersRepository: UsersMongoRepository,
    private readonly usersPostgresqlRepository: UsersPostgresqlRepository,
    private cryptoService: CryptoService,
    private configService: ConfigService<ConfigurationType, true>,
  ) {}

  async execute(command: CreateUserCommand) {
    const apiSettings: ApiSettings = this.configService.get('apiSettings', {
      infer: true,
    });

    // const [foundUserByLogin, foundUserByEmail]: [User | null, User | null] =
    //   await Promise.all([
    //     this.usersRepository.findByField('login', command.login),
    //     this.usersRepository.findByField('email', command.email),
    //   ]);

    // if (foundUserByLogin || foundUserByEmail) {
    //   return Result.badRequest('User already exists');
    // }
    //
    // const generatedPasswordHash: string = await this.cryptoService.createHash(
    //   command.password,
    //   apiSettings.HASH_ROUNDS,
    // );

    // ??? how to create user correctly
    // const newUser: UserDocument = new this.userModel({
    //   login: command.login,
    //   password: generatedPasswordHash,
    //   email: command.email,
    //   createdAt: new Date(),
    //   emailConfirmation: {
    //     confirmationCode: randomUUID(),
    //     expirationDate: new Date(),
    //     isConfirmed: true,
    //   },
    //   passwordRecovery: {
    //     recoveryCode: '',
    //     expirationDate: new Date(),
    //   },
    // });

    //const createdUser: UserDocument = await this.usersRepository.save(newUser);

    //return Result.success(createdUser.id);
    return Result.success();
  }
}
