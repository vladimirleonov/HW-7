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
import { ApiAccessLogsRepository } from './auth/infrastructure/api-access-logs.repository';
import { TerminateAllOtherUserDevicesUseCase } from './security/application/use-cases/terminate-all-other-user-devices.usecase';
import { TerminateUserDeviceUseCase } from './security/application/use-cases/terminate-user-device.usecase';
import { SecurityService } from './security/application/security.service';
import { DevicesRepository } from './security/infrastructure/device.repository';
import { DeviceQueryRepository } from './security/infrastructure/device.query-repository';
import { SecurityController } from './security/api/security.controller';
import { AuthController } from './auth/api/auth.controller';
import { UsersModule } from '../users/users.module';
import { CryptoService } from '../../core/application/crypto.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/domain/user.entity';
import { NodemailerService } from '../../core/application/nodemailer.service';
import { JwtService } from '@nestjs/jwt';
import { Device, DeviceSchema } from './security/domain/device.entity';
import {
  ApiAccessLog,
  ApiAccessLogSchema,
} from './auth/domain/api-access-log.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { RequestUtils } from '../../core/application/utils.service';
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
  ApiAccessLogsRepository,

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
  SecurityService,

  // repositories
  DevicesRepository,
  DeviceQueryRepository,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: ApiAccessLog.name, schema: ApiAccessLogSchema },
    ]),
    UsersModule,
  ],
  controllers: [AuthController, SecurityController],
  providers: [
    ...authProviders,
    ...securityProviders,
    CryptoService,
    NodemailerService,
    JwtService,
    RequestUtils,
  ],
  exports: [AuthService],
})
export class AuthModule {}
