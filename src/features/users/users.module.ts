import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { UsersController } from './api/users.controller';
import { CryptoService } from '../../core/application/crypto.service';
import { CqrsModule } from '@nestjs/cqrs';
import { LoginIsExistConstraint } from '../../core/decorators/validate/login-is-exist.decorator';
import { EmailIsExistConstraint } from '../../core/decorators/validate/email-is-exist.decorator';

const usersProviders: Provider[] = [
  // use cases
  CreateUserUseCase,
  DeleteUserUseCase,

  // repositories
  UsersRepository,
  UsersQueryRepository,

  // validation constraints
  LoginIsExistConstraint,
  EmailIsExistConstraint,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [...usersProviders, CryptoService],
  exports: [UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
