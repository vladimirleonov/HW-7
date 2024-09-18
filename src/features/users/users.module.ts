import { Module, Provider } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase';
import { UsersController } from './api/users.controller';
import { CryptoService } from '../../core/application/crypto.service';
import { CqrsModule } from '@nestjs/cqrs';
// import { LoginIsExistConstraint } from '../../core/decorators/validators/login-is-exist.decorator';
import { EmailIsExistConstraint } from '../../core/decorators/validators/email-is-exist.decorator';
import { UsersPostgresRepository } from './infrastructure/postgresql/users-postgresql.repository';
import { UsersPostgresqlQueryRepository } from './infrastructure/postgresql/users-postgresql.query-repository';

const usersProviders: Provider[] = [
  // use cases
  CreateUserUseCase,
  DeleteUserUseCase,

  // repositories
  // UsersMongoRepository,
  // UsersMongoQueryRepository,
  UsersPostgresRepository,
  UsersPostgresqlQueryRepository,

  // validation constraints
  // LoginIsExistConstraint,
  EmailIsExistConstraint,
];

@Module({
  imports: [
    CqrsModule,
    // MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [...usersProviders, CryptoService],
  exports: [UsersPostgresRepository, UsersPostgresqlQueryRepository],
})
export class UsersModule {}
