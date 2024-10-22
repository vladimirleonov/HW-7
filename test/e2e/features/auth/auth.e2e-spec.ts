import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../utils/init-settings';
import { deleteAllData } from '../../utils/delete-all-data';
import { AuthTestManager } from './auth-test-manager';
import { RegistrationModel } from '../../../../src/features/auth/auth/api/models/input/registration.input.model';
import { NodemailerService } from '../../../../src/core/application/nodemailer.service';
import { NodemailerServiceMock } from '../../mock/nodemailer.service.mock';
import { wait } from '../../utils/wait';
// to use registrationEmailTemplate function as object property
import * as registrationEmailTemplates from '../../../../src/core/email-templates/registration-email-template';
import * as recoveryEmailTemplates from '../../../../src/core/email-templates/password-recovery-email-template';
import { ConfirmRegistrationModel } from '../../../../src/features/auth/auth/api/models/input/confirm-registration.model';
import { RegistrationEmailResendingModel } from '../../../../src/features/auth/auth/api/models/input/registration-email-resending.model';
import { PasswordRecoveryModel } from '../../../../src/features/auth/auth/api/models/input/password-recovery.model';
import { NewPasswordModel } from '../../../../src/features/auth/auth/api/models/input/new-password.model';
import { LoginModel } from '../../../../src/features/auth/auth/api/models/input/login.input.model';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let nodemailerServiceMock: NodemailerServiceMock;

  beforeAll(async () => {
    await initSettings((moduleBuilder) =>
      //override NodemailerService
      moduleBuilder
        .overrideProvider(NodemailerService)
        .useClass(NodemailerServiceMock),
    );
    // app = result.app;
    // userTestManger = result.userTestManger;

    app = expect.getState().app;
    // console.log('app', app);
    authTestManager = expect.getState().authTestManager;

    // nodemailerServiceMock = new NodemailerServiceMock();
    // !!! get instance from container, not create new instance
    nodemailerServiceMock = app.get<NodemailerServiceMock>(NodemailerService);

    if (!app) {
      throw new Error('Application failed to initialize');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // await wait(4);
    await deleteAllData(expect.getState().dataSource);
    jest.clearAllMocks();
  });

  // registration
  it('should register user', async () => {
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    await authTestManager.registration(body, HttpStatus.NO_CONTENT);
  });

  it('should not register user short login', async () => {
    const body: RegistrationModel = {
      login: 'na',
      password: 'qwerty',
      email: 'email@email.com',
    };

    await authTestManager.registration(body, HttpStatus.BAD_REQUEST);
  });

  it('should not register user short password', async () => {
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwer',
      email: 'email@email.com',
    };

    await authTestManager.registration(body, HttpStatus.BAD_REQUEST);
  });

  it('should not register user incorrect email format', async () => {
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'emailemail.com',
    };

    await authTestManager.registration(body, HttpStatus.BAD_REQUEST);
  });

  it('should not register user with same login', async () => {
    const body1: RegistrationModel = {
      login: 'name1',
      password: 'qwerty1',
      email: 'emaile@mail1.com',
    };

    const body2: RegistrationModel = {
      login: 'name1',
      password: 'qwerty2',
      email: 'emaile@mail2.com',
    };

    await authTestManager.registration(body1, HttpStatus.NO_CONTENT);

    await authTestManager.registration(body2, HttpStatus.BAD_REQUEST);
  });

  it('should not register user with same email', async () => {
    const body1: RegistrationModel = {
      login: 'name1',
      password: 'qwerty1',
      email: 'emaile@mail1.com',
    };

    const body2: RegistrationModel = {
      login: 'name2',
      password: 'qwerty1',
      email: 'emaile@mail1.com',
    };

    await authTestManager.registration(body1, HttpStatus.NO_CONTENT);
    await authTestManager.registration(body2, HttpStatus.BAD_REQUEST);
  });

  // registration-confirmation
  it('successfully confirm registration', async () => {
    ////////////////////////
    // registration
    ////////////////////////
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling registrationEmailTemplate
    const spyRegistrationEmailTemplate = jest.spyOn(
      registrationEmailTemplates,
      'registrationEmailTemplate',
    );
    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(body, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      body.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyRegistrationEmailTemplate.mock.calls[0][0];
    // console.log(confirmationCode);

    ////////////////////////
    // confirm registration
    ////////////////////////

    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: confirmationCode,
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody);
  });

  it('invalid confirmation code', async () => {
    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: '12a5cb891sc',
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody, 400);
  });

  // registration-email-resending
  it('successfully resend email confirmation', async () => {
    /////////////////
    // register user
    /////////////////
    const registrationBody: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(registrationBody, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      registrationBody.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    ///////////////////
    // email resending
    ///////////////////

    const registrationEmailResendingBody: RegistrationEmailResendingModel = {
      email: registrationBody.email,
    };

    await authTestManager.registrationEmailResending(
      registrationEmailResendingBody,
    );
  });

  it('incorrect email', async () => {
    const registrationEmailResendingBody: RegistrationEmailResendingModel = {
      email: 'test1234@gmail.com',
    };

    await authTestManager.registrationEmailResending(
      registrationEmailResendingBody,
      400,
    );
  });

  it('user already confirmed', async () => {
    /////////////////
    // register user
    /////////////////
    const registrationBody: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling registrationEmailTemplate
    const spyRegistrationEmailTemplate = jest.spyOn(
      registrationEmailTemplates,
      'registrationEmailTemplate',
    );
    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(registrationBody, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      registrationBody.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyRegistrationEmailTemplate.mock.calls[0][0];
    // console.log(confirmationCode);

    ///////////////////////
    // confirm registration
    ///////////////////////

    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: confirmationCode,
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody);

    ////////////////////////////
    // resend registration email
    ////////////////////////////

    const registrationEmailResendingBody: RegistrationEmailResendingModel = {
      email: registrationBody.email,
    };

    await authTestManager.registrationEmailResending(
      registrationEmailResendingBody,
      400,
    );
  });

  // password-recovery
  it('successfully send password recovery email', async () => {
    ////////////////
    // registration
    ////////////////
    const registrationBody: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    await authTestManager.registration(registrationBody, HttpStatus.NO_CONTENT);

    /////////////////////
    // password recovery
    /////////////////////

    const psswordRecoveryBody: PasswordRecoveryModel = {
      email: 'email@email.com',
    };

    await authTestManager.passwordRecovery(psswordRecoveryBody);
  });

  it('send password recovery on invalid email', async () => {
    const psswordRecoveryBody: PasswordRecoveryModel = {
      email: 'email@email.com',
    };

    // !!! Even if current email is not registered (for prevent user's email detection)
    await authTestManager.passwordRecovery(psswordRecoveryBody, 204);
  });

  it('incorrect email format', async () => {
    const psswordRecoveryBody: PasswordRecoveryModel = {
      email: 'email^^^email.com',
    };

    // !!! Even if current email is not registered (for prevent user's email detection)
    await authTestManager.passwordRecovery(psswordRecoveryBody, 400);
  });

  // new-password
  it('successfully set new password with valid recovery code', async () => {
    ////////////////
    // registration
    ////////////////
    const registrationBody: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    await authTestManager.registration(registrationBody, HttpStatus.NO_CONTENT);

    /////////////////////
    // password recovery
    /////////////////////

    const psswordRecoveryBody: PasswordRecoveryModel = {
      email: registrationBody.email,
    };

    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');
    // spyOn on calling passwordRecoveryEmailTemplate
    const spyPasswordRecoveryEmailTemplate = jest.spyOn(
      recoveryEmailTemplates,
      'passwordRecoveryEmailTemplate',
    );

    await authTestManager.passwordRecovery(psswordRecoveryBody);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      registrationBody.email,
      expect.any(String),
      'Password Recovery',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyPasswordRecoveryEmailTemplate.mock.calls[0][0];
    // .log('confirmationCode', confirmationCode);

    ////////////////
    // new-password
    ////////////////

    const newPasswordBody: NewPasswordModel = {
      newPassword: 'test1111',
      recoveryCode: confirmationCode,
    };

    await authTestManager.newPassword(newPasswordBody);
  });

  it('incorrect new password length', async () => {
    ////////////////
    // registration
    ////////////////
    const registrationBody: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    await authTestManager.registration(registrationBody, HttpStatus.NO_CONTENT);

    /////////////////////
    // password recovery
    /////////////////////

    const psswordRecoveryBody: PasswordRecoveryModel = {
      email: registrationBody.email,
    };

    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');
    // spyOn on calling passwordRecoveryEmailTemplate
    const spyPasswordRecoveryEmailTemplate = jest.spyOn(
      recoveryEmailTemplates,
      'passwordRecoveryEmailTemplate',
    );

    await authTestManager.passwordRecovery(psswordRecoveryBody);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      registrationBody.email,
      expect.any(String),
      'Password Recovery',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyPasswordRecoveryEmailTemplate.mock.calls[0][0];
    // console.log('confirmationCode', confirmationCode);

    ////////////////
    // new-password
    ////////////////

    const newPasswordBody: NewPasswordModel = {
      newPassword: '123',
      recoveryCode: confirmationCode,
    };

    const response = await authTestManager.newPassword(newPasswordBody, 400);

    expect(response.body.errorsMessages[0].field).toBe('newPassword');
  });

  it('incorrect recovery code', async () => {
    ////////////////
    // registration
    ////////////////
    const registrationBody: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    await authTestManager.registration(registrationBody, HttpStatus.NO_CONTENT);

    /////////////////////
    // password recovery
    /////////////////////

    const psswordRecoveryBody: PasswordRecoveryModel = {
      email: registrationBody.email,
    };

    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.passwordRecovery(psswordRecoveryBody);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      registrationBody.email,
      expect.any(String),
      'Password Recovery',
    );
    expect(spySendEmail).toHaveBeenCalled();

    ////////////////
    // new-password
    ////////////////

    const newPasswordBody: NewPasswordModel = {
      newPassword: 'test1234',
      recoveryCode: '12cb41',
    };

    const response = await authTestManager.newPassword(newPasswordBody, 400);

    expect(response.body.errorsMessages[0].field).toBe('recoveryCode');
  });

  // login
  it('should successfully login user', async () => {
    ////////////////////////
    // registration
    ////////////////////////
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling registrationEmailTemplate
    const spyRegistrationEmailTemplate = jest.spyOn(
      registrationEmailTemplates,
      'registrationEmailTemplate',
    );
    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(body, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      body.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyRegistrationEmailTemplate.mock.calls[0][0];
    // console.log(confirmationCode);

    ////////////////////////
    // confirm registration
    ////////////////////////

    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: confirmationCode,
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody);

    /////////////////////
    // login user
    /////////////////////

    const loginBody: LoginModel = {
      loginOrEmail: 'email@email.com',
      password: 'qwerty',
    };

    const result = await authTestManager.login(loginBody);
    expect(result.body).toHaveProperty('accessToken');

    const cookie = Array.isArray(result.headers['set-cookie'])
      ? result.headers['set-cookie']
      : [result.headers['set-cookie']];
    // console.log('cookie', cookie);
    // console.log(typeof cookie);
    expect(cookie.some((c) => c.startsWith('refreshToken'))).toBe(true);
  });

  it('should not login user incorrect login', async () => {
    ////////////////////////
    // registration
    ////////////////////////
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling registrationEmailTemplate
    const spyRegistrationEmailTemplate = jest.spyOn(
      registrationEmailTemplates,
      'registrationEmailTemplate',
    );
    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(body, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      body.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyRegistrationEmailTemplate.mock.calls[0][0];
    // console.log(confirmationCode);

    ////////////////////////
    // confirm registration
    ////////////////////////

    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: confirmationCode,
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody);

    /////////////////////
    // login user
    /////////////////////

    const loginBody: LoginModel = {
      loginOrEmail: 'testqwerty@email.com',
      password: 'qwerty',
    };

    await authTestManager.login(loginBody, 401);
  });

  it('should not login user incorrect password', async () => {
    ////////////////////////
    // registration
    ////////////////////////
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling registrationEmailTemplate
    const spyRegistrationEmailTemplate = jest.spyOn(
      registrationEmailTemplates,
      'registrationEmailTemplate',
    );
    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(body, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      body.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyRegistrationEmailTemplate.mock.calls[0][0];
    // console.log(confirmationCode);

    ////////////////////////
    // confirm registration
    ////////////////////////

    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: confirmationCode,
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody);

    /////////////////////
    // login user
    /////////////////////

    const loginBody: LoginModel = {
      loginOrEmail: 'email@email.com',
      password: 'incorrect',
    };

    await authTestManager.login(loginBody, 401);
  });

  it('should not login user second time - valid refresh token in cookie', async () => {
    ////////////////////////
    // registration
    ////////////////////////
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling registrationEmailTemplate
    const spyRegistrationEmailTemplate = jest.spyOn(
      registrationEmailTemplates,
      'registrationEmailTemplate',
    );
    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(body, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      body.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyRegistrationEmailTemplate.mock.calls[0][0];
    // console.log(confirmationCode);

    ////////////////////////
    // confirm registration
    ////////////////////////

    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: confirmationCode,
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody);

    /////////////////////
    // login user
    /////////////////////

    const loginBody: LoginModel = {
      loginOrEmail: 'email@email.com',
      password: 'qwerty',
    };

    const result = await authTestManager.login(loginBody);
    expect(result.body).toHaveProperty('accessToken');

    const cookie = Array.isArray(result.headers['set-cookie'])
      ? result.headers['set-cookie']
      : [result.headers['set-cookie']];
    // console.log('cookie', cookie);
    // console.log(typeof cookie);
    expect(cookie.some((c) => c.startsWith('refreshToken'))).toBe(true);

    /////////////////////
    // login again
    /////////////////////
    // console.log(cookie)
    // [
    //   'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc0LCJkZXZpY2VJZCI6IjgzZGYwYzFmLWQ2NDYtNGQ0ZC1hMTA2LWVjZGVkYWU0NTMyNSIsImlhdCI6MTcyOTI4Mjk1MiwiZXhwIjoxNzI5MzU0OTUyfQ.1oZxwTY8UtM1882FuSTdvbOCvYLciGV4Nh7ORN16vgI; Path=/; HttpOnly; Secure; SameSite=Strict'
    // ]
    const refreshToken = cookie
      .find((c) => c.startsWith('refreshToken'))
      ?.split(';')[0]
      ?.split('=')[1];
    // console.log(refreshToken);
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJkZXZpY2VJZCI6IjdjMmViODkwLTdiYWItNDVkZi05ZWMxLTZiOGFhMTcyOTgxMCIsImlhdCI6MTcyOTI4Mjk5NywiZXhwIjoxNzI5MzU0OTk3fQ.bEYgCIEpJWxOu2QYYWBU8cL5LD2dP6qLdBcZ2leZ4KQ

    await authTestManager.loginWithRefreshToken(loginBody, 401, refreshToken);
  });

  it('should not login user, email not confirmed', async () => {
    ////////////////////////
    // registration
    ////////////////////////
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(body, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      body.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    ////////////////////////
    // confirm registration
    ////////////////////////

    // ...

    /////////////////////
    // login user
    /////////////////////

    const loginBody: LoginModel = {
      loginOrEmail: 'email@email.com',
      password: 'qwerty',
    };

    await authTestManager.login(loginBody, 401);
  });

  // refresh-token
  it('should successfully refresh token', async () => {
    ////////////////////////
    // registration
    ////////////////////////
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling registrationEmailTemplate
    const spyRegistrationEmailTemplate = jest.spyOn(
      registrationEmailTemplates,
      'registrationEmailTemplate',
    );
    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(body, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      body.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyRegistrationEmailTemplate.mock.calls[0][0];
    // console.log(confirmationCode);

    ////////////////////////
    // confirm registration
    ////////////////////////

    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: confirmationCode,
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody);

    /////////////////////
    // login user
    /////////////////////

    const loginBody: LoginModel = {
      loginOrEmail: 'email@email.com',
      password: 'qwerty',
    };

    const loginResult1 = await authTestManager.login(loginBody);
    expect(loginResult1.body).toHaveProperty('accessToken');

    const cookie1 = Array.isArray(loginResult1.headers['set-cookie'])
      ? loginResult1.headers['set-cookie']
      : [loginResult1.headers['set-cookie']];
    // console.log('cookie', cookie);
    // console.log(typeof cookie);
    expect(cookie1.some((c) => c.startsWith('refreshToken'))).toBe(true);

    /////////////////////
    // refresh token pair
    /////////////////////

    const refreshToken1 = cookie1
      .find((c) => c.startsWith('refreshToken'))
      ?.split(';')[0]
      ?.split('=')[1];

    const refreshTokenResult =
      await authTestManager.refreshToken(refreshToken1);
    expect(refreshTokenResult.body).toHaveProperty('accessToken');

    const cookie2 = Array.isArray(refreshTokenResult.headers['set-cookie'])
      ? refreshTokenResult.headers['set-cookie']
      : [refreshTokenResult.headers['set-cookie']];

    expect(cookie2.some((c) => c.startsWith('refreshToken'))).toBe(true);

    //////////////////////////////////////////////////////////
    // login with new valid refresh token (401 because valid)
    //////////////////////////////////////////////////////////

    const refreshToken2 = cookie2
      .find((c) => c.startsWith('refreshToken'))
      ?.split(';')[0]
      ?.split('=')[1];

    await authTestManager.loginWithRefreshToken(loginBody, 401, refreshToken2);
  });

  it('should not refresh token - invalid refresh token passed in cookie', async () => {
    ////////////////////////
    // registration
    ////////////////////////
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling registrationEmailTemplate
    const spyRegistrationEmailTemplate = jest.spyOn(
      registrationEmailTemplates,
      'registrationEmailTemplate',
    );
    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(body, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      body.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyRegistrationEmailTemplate.mock.calls[0][0];
    // console.log(confirmationCode);

    ////////////////////////
    // confirm registration
    ////////////////////////

    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: confirmationCode,
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody);

    /////////////////////
    // login user
    /////////////////////

    const loginBody: LoginModel = {
      loginOrEmail: 'email@email.com',
      password: 'qwerty',
    };

    const loginResult1 = await authTestManager.login(loginBody);
    expect(loginResult1.body).toHaveProperty('accessToken');

    const cookie1 = Array.isArray(loginResult1.headers['set-cookie'])
      ? loginResult1.headers['set-cookie']
      : [loginResult1.headers['set-cookie']];
    // console.log('cookie', cookie);
    // console.log(typeof cookie);
    expect(cookie1.some((c) => c.startsWith('refreshToken'))).toBe(true);

    /////////////////////
    // refresh token pair
    /////////////////////

    const refreshToken1 =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImRldmljZUlkIjoiOGI3M2NhMzUtMjA0OS00NjRkLTllYzQtNzVkNzQ0NDRlZDJlIiwiaWF0IjoxNzI5MTExNjk3LCJleHAiOjE3MjkxODM2OTd9.xKP4xfvhDe8GWJI6Hi6W181ASkOWzguhz5F00pe_8el';

    await authTestManager.refreshToken(refreshToken1, 401);
  });

  // logout
  it('should successfully logout user', async () => {
    ////////////////////////
    // registration
    ////////////////////////
    const body: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling registrationEmailTemplate
    const spyRegistrationEmailTemplate = jest.spyOn(
      registrationEmailTemplates,
      'registrationEmailTemplate',
    );
    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(body, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      body.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyRegistrationEmailTemplate.mock.calls[0][0];
    // console.log(confirmationCode);

    ////////////////////////
    // confirm registration
    ////////////////////////

    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: confirmationCode,
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody);

    /////////////////////
    // login user
    /////////////////////

    const loginBody: LoginModel = {
      loginOrEmail: 'email@email.com',
      password: 'qwerty',
    };

    const loginResult = await authTestManager.login(loginBody);
    expect(loginResult.body).toHaveProperty('accessToken');

    const cookie = Array.isArray(loginResult.headers['set-cookie'])
      ? loginResult.headers['set-cookie']
      : [loginResult.headers['set-cookie']];
    // console.log('cookie', cookie);
    // console.log(typeof cookie);
    expect(cookie.some((c) => c.startsWith('refreshToken'))).toBe(true);

    //////////
    // logout
    //////////

    const refreshToken = cookie
      .find((c) => c.startsWith('refreshToken'))
      ?.split(';')[0]
      ?.split('=')[1];

    await authTestManager.logout(refreshToken);
  });

  it('should not logout user - invalid refresh token passed in cookie', async () => {
    const refreshToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImRldmljZUlkIjoiOGI3M2NhMzUtMjA0OS00NjRkLTllYzQtNzVkNzQ0NDRlZDJlIiwiaWF0IjoxNzI5MTExNjk3LCJleHAiOjE3MjkxODM2OTd9.xKP4xfvhDe8GWJI6Hi6W181ASkOWzguhz5F00pe_8el';

    await authTestManager.logout(refreshToken, 401);
  });

  // me
  it('should successfully get me', async () => {
    ////////////////////////
    // registration
    ////////////////////////
    const registrationBody: RegistrationModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    // spyOn on calling registrationEmailTemplate
    const spyRegistrationEmailTemplate = jest.spyOn(
      registrationEmailTemplates,
      'registrationEmailTemplate',
    );
    // spyOn on calling nodemailerServiceMock.sendEmail
    const spySendEmail = jest.spyOn(nodemailerServiceMock, 'sendEmail');

    await authTestManager.registration(registrationBody, HttpStatus.NO_CONTENT);

    // expect(spyRegistrationEmailTemplate).toHaveBeenCalled();
    expect(nodemailerServiceMock.sendEmail).toHaveBeenCalledWith(
      registrationBody.email,
      expect.any(String),
      'Registration Confirmation',
    );
    expect(spySendEmail).toHaveBeenCalled();

    const confirmationCode: string =
      spyRegistrationEmailTemplate.mock.calls[0][0];
    // console.log(confirmationCode);

    ////////////////////////
    // confirm registration
    ////////////////////////

    const confirmRegistrationBody: ConfirmRegistrationModel = {
      code: confirmationCode,
    };

    await authTestManager.confirmRegistration(confirmRegistrationBody);

    /////////////////////
    // login user
    /////////////////////

    const loginBody: LoginModel = {
      loginOrEmail: 'email@email.com',
      password: 'qwerty',
    };

    const loginResult = await authTestManager.login(loginBody);
    expect(loginResult.body).toHaveProperty('accessToken');

    const cookie = Array.isArray(loginResult.headers['set-cookie'])
      ? loginResult.headers['set-cookie']
      : [loginResult.headers['set-cookie']];
    // console.log('cookie', cookie);
    // console.log(typeof cookie);
    expect(cookie.some((c) => c.startsWith('refreshToken'))).toBe(true);

    //////////
    // get me
    //////////

    const accessToken = loginResult.body.accessToken;

    const meResult = await authTestManager.me(accessToken);
    expect(meResult.body.login).toBe(registrationBody.login);
    expect(meResult.body.email).toBe(registrationBody.email);
    expect(meResult.body.userId).toEqual(expect.any(String));
  });

  it('should not me user - invalid access token passed in Authorization header ', async () => {
    const accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImlhdCI6MTcyOTExMTY5NywiZXhwIjoxNzI5MTQ3Njk3fQ.G40Pd5wMKL6jdVOx_eXzPc2RUqegLcAYez3QNFMWy08';

    await authTestManager.me(accessToken, 401);
  });
});
