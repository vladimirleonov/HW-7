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
import { DevicesPostgresRepository } from './security/infrastructure/postgres/device-postgres.repository';
import { DevicesPostgresQueryRepository } from './security/infrastructure/postgres/device-postgres.query-repository';
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
  DevicesPostgresRepository,
  DevicesPostgresQueryRepository,
];

@Module({
  imports: [CqrsModule, UsersModule],
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
