import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../utils/init-settings';
import { deleteAllData } from '../../utils/delete-all-data';
import { AuthTestManager } from './auth-test-manager';
import { RegistrationModel } from '../../../../src/features/auth/api/models/input/registration.input.model';
import { NodemailerService } from '../../../../src/core/application/nodemailer.service';
import { NodemailerServiceMock } from '../../mock/nodemailer.service.mock';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;

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
    authTestManager = expect.getState().authTestManager;
    console.log('authTestManger', authTestManager);

    console.log('App initialized:', !!app);
    if (!app) {
      throw new Error('Application failed to initialize');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(expect.getState().databaseConnection);
  });

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

    const response = await authTestManager.registration(
      body1,
      HttpStatus.NO_CONTENT,
    );
    console.log(response);
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
      email: 'emaile@mail2.com',
    };

    await authTestManager.registration(body1, HttpStatus.NO_CONTENT);
    await authTestManager.registration(body2, HttpStatus.BAD_REQUEST);
  });
});
