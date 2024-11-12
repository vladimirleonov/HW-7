import { Module, Provider } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase';
import { UsersController } from './api/users.controller';
import { CryptoService } from '../../core/application/crypto.service';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersTypeormRepository } from './infrastructure/typeorm/users-typeorm.repository';
import { UsersTypeormQueryRepository } from './infrastructure/typeorm/users-typeorm.query-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConfirmation } from './domain/email-confirmation';
import { User } from './domain/user.entity';
import { PasswordRecovery } from './domain/password-recovery';
import { GetAllUsersUseCase } from './api/queries/get-all-users.query';

const usersProviders: Provider[] = [
  // use cases
  CreateUserUseCase,
  DeleteUserUseCase,
  GetAllUsersUseCase,

  // repositories
  UsersTypeormRepository,
  UsersTypeormQueryRepository,

  // validation constraints
  // LoginIsExistConstraint
  // EmailIsExistConstraint,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([User, EmailConfirmation, PasswordRecovery]),
  ],
  controllers: [UsersController],
  providers: [...usersProviders, CryptoService],
  exports: [UsersTypeormRepository, UsersTypeormQueryRepository],
})
export class UsersModule {}
