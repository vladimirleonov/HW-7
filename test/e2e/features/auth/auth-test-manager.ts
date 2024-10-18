import { INestApplication } from '@nestjs/common';
import { RegistrationModel } from '../../../../src/features/auth/auth/api/models/input/registration.input.model';
import request from 'supertest';
import { ConfirmRegistrationModel } from '../../../../src/features/auth/auth/api/models/input/confirm-registration.model';
import { RegistrationEmailResendingModel } from '../../../../src/features/auth/auth/api/models/input/registration-email-resending.model';
import { PasswordRecoveryModel } from '../../../../src/features/auth/auth/api/models/input/password-recovery.model';
import { NewPasswordModel } from '../../../../src/features/auth/auth/api/models/input/new-password.model';
import { LoginModel } from '../../../../src/features/auth/auth/api/models/input/login.input.model';

export class AuthTestManager {
  constructor(protected readonly app: INestApplication) {}

  async registration(
    registrationModel: RegistrationModel,
    statusCode: number = 204,
  ) {
    return request(this.app.getHttpServer())
      .post('/api/auth/registration')
      .send(registrationModel)
      .expect(statusCode);
  }

  async confirmRegistration(
    confirmRegistrationModel: ConfirmRegistrationModel,
    statusCode: number = 204,
  ) {
    return request(this.app.getHttpServer())
      .post('/api/auth/registration-confirmation')
      .send(confirmRegistrationModel)
      .expect(statusCode);
  }

  async registrationEmailResending(
    registrationEmailResendingModel: RegistrationEmailResendingModel,
    statusCode: number = 204,
  ) {
    return request(this.app.getHttpServer())
      .post('/api/auth/registration-email-resending')
      .send(registrationEmailResendingModel)
      .expect(statusCode);
  }

  async passwordRecovery(
    passwordRecoveryModel: PasswordRecoveryModel,
    statusCode: number = 204,
  ) {
    return request(this.app.getHttpServer())
      .post('/api/auth/password-recovery')
      .send(passwordRecoveryModel)
      .expect(statusCode);
  }

  async newPassword(
    newPasswordModel: NewPasswordModel,
    statusCode: number = 204,
  ) {
    return request(this.app.getHttpServer())
      .post('/api/auth/new-password')
      .send(newPasswordModel)
      .expect(statusCode);
  }

  async login(loginModel: LoginModel, statusCode: number = 200) {
    return request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send(loginModel)
      .expect(statusCode);
  }

  async loginWithRefreshToken(
    loginModel: LoginModel,
    statusCode: number = 200,
    refreshToken = null,
  ) {
    const requestBuilder = request(this.app.getHttpServer())
      .post('/api/auth/login')
      .expect(statusCode);

    if (refreshToken) {
      requestBuilder.set('Cookie', `refreshToken=${refreshToken}`);
    }

    return requestBuilder;
  }
}
