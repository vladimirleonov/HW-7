import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../utils/init-settings';
import { deleteAllData } from '../../utils/delete-all-data';
import { AuthTestManager } from './auth-test-manager';
import { RegistrationModel } from '../../../../src/features/auth/api/models/input/registration.input.model';
import { NodemailerService } from '../../../../src/core/application/nodemailer.service';
import { NodemailerServiceMock } from '../../mock/nodemailer.service.mock';

describe('auth', () => {
  let app: INestApplication;
  let authTestManger: AuthTestManager;

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
    authTestManger = expect.getState().authTestManger;
    console.log(authTestManger);

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

    const response = await authTestManger.registration(
      body,
      HttpStatus.NO_CONTENT,
    );

    expect(response.body).toEqual({
      login: body.login,
      email: body.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });
});
