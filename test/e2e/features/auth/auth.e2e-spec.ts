import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../utils/init-settings';
import { deleteAllData } from '../../utils/delete-all-data';
import { AuthTestManager } from './auth-test-manager';
import { UserCreateModel } from '../../../../src/features/users/api/models/input/create-user.input.model';
import { RegistrationModel } from '../../../../src/features/auth/api/models/input/registration.input.model';

describe('auth', () => {
  let app: INestApplication;
  let authTestManger: AuthTestManager;

  beforeAll(async () => {
    await initSettings();
    // await initSettings((moduleBuilder) =>
    //   //override UsersService еще раз
    //   moduleBuilder.overrideProvider(UsersService).useFactory({
    //     factory: (repo: UsersRepository, authService: AuthService) => {
    //       return new UserServiceMock(repo, authService);
    //     },
    //     inject: [UsersRepository, AuthService],
    //   }),
    // );
    // app = result.app;
    // userTestManger = result.userTestManger;

    app = expect.getState().app;
    authTestManger = expect.getState().authTestManger;

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
