import { Module, Provider } from '@nestjs/common';
import { RegistrationUseCase } from './auth/application/use-cases/registration-user.usecase';
import { ConfirmRegistrationUseCase } from './auth/application/use-cases/confirm-registration.usecase';
import { RegistrationEmailResendingUseCase } from './auth/application/use-cases/registration-email-resending.usecase';
import { PasswordRecoveryUseCase } from './auth/application/use-cases/password-recovery.usecase';
import { SetNewPasswordUseCase } from './auth/application/use-cases/set-new-password.usecase';
import { LoginUseCase } from './auth/application/use-cases/login.usecase';
import { RefreshTokenUseCase } from './auth/application/use-cases/refresh-token.usecase';
import { LogoutUseCase } from './auth/application/use-cases/logout';
import { AuthService } from './auth/application/auth.service';
import { TerminateAllOtherUserDevicesUseCase } from './security/application/use-cases/terminate-all-other-user-devices.usecase';
import { TerminateUserDeviceUseCase } from './security/application/use-cases/terminate-user-device.usecase';
import { DevicesTypeormRepository } from './security/infrastructure/typeorm/device-typeorm.repository';
import { DevicesTypeormQueryRepository } from './security/infrastructure/typeorm/device-typeorm.query-repository';
import { SecurityController } from './security/api/security.controller';
import { AuthController } from './auth/api/auth.controller';
import { UsersModule } from '../users/users.module';
import { CryptoService } from '../../core/application/crypto.service';
import { NodemailerService } from '../../core/application/nodemailer.service';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { LocalStrategy } from '../../core/stratagies/local.strategy';
import { JwtStrategy } from '../../core/stratagies/jwt.strategy';
import { BasicStrategy } from '../../core/stratagies/basic.strategy';
import { RefreshTokenJwtStrategy } from '../../core/stratagies/refresh-token-jwt.strategy';
import { OptionalJwtStrategy } from '../../core/stratagies/optional-jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './security/domain/device.entity';
import { GetAllDevicesUseCase } from './security/api/queries/get-all-devices.query';

const authProviders: Provider[] = [
  // use cases
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUseCase,
  SetNewPasswordUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  //
  GetAllDevicesUseCase,

  // service
  AuthService,

  // repository

  // strategies
  LocalStrategy,
  JwtStrategy,
  BasicStrategy,
  RefreshTokenJwtStrategy,
  OptionalJwtStrategy,
];

const securityProviders: Provider[] = [
  // use cases
  TerminateAllOtherUserDevicesUseCase,
  TerminateUserDeviceUseCase,

  // service

  // repositories
  // DevicesPostgresRepository,
  // DevicesPostgresQueryRepository,
  DevicesTypeormRepository,
  DevicesTypeormQueryRepository,
];

@Module({
  imports: [CqrsModule, UsersModule, TypeOrmModule.forFeature([Device])],
  controllers: [AuthController, SecurityController],
  providers: [
    ...authProviders,
    ...securityProviders,
    CryptoService,
    NodemailerService,
    JwtService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
