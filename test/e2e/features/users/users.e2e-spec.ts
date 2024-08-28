import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../../utils/init-settings';
import { UsersTestManager } from './users-test-manager';
import { CreateDecoratorOptions } from '@nestjs/core';
import { UserCreateModel } from '../../../../src/features/users/api/models/input/create-user.input.model';
import { deleteAllData } from '../../../utils/delete-all-data';

const TEST_ADMIN_CREDENTIALS = {
  login: 'admin',
  password: 'qwerty',
};

describe('users', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    // jest.setTimeout(30000);
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
    userTestManger = expect.getState().userTestManger;

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

  // create
  it('should create user', async () => {
    const body: UserCreateModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    const response = await userTestManger.createUser(
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      body,
    );

    expect(response.body).toEqual({
      login: body.login,
      email: body.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('should create user unauthorized', async () => {
    const body: UserCreateModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    await userTestManger.createUser(
      'test',
      TEST_ADMIN_CREDENTIALS.password,
      body,
      HttpStatus.UNAUTHORIZED,
    );
  });

  it('should create user short login', async () => {
    const body: UserCreateModel = {
      login: 'na',
      password: 'qwerty',
      email: 'email@email.com',
    };

    await userTestManger.createUser(
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      body,
      HttpStatus.BAD_REQUEST,
    );
  });

  // delete
  it('should successfully delete user', async () => {
    const body: UserCreateModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    const response = await userTestManger.createUser(
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      body,
    );

    console.log(response);

    expect(response.body).toEqual({
      login: body.login,
      email: body.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });

    const createdId: string = response.body.id;

    await userTestManger.deleteUser(
      createdId,
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      HttpStatus.NO_CONTENT,
    );
  });
  it('should not delete user unauthorized', async () => {
    const body: UserCreateModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.com',
    };

    const response = await userTestManger.createUser(
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      body,
    );

    console.log(response);

    expect(response.body).toEqual({
      login: body.login,
      email: body.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });

    const createdId: string = response.body.id;

    await userTestManger.deleteUser(
      createdId,
      'test',
      TEST_ADMIN_CREDENTIALS.password,
      HttpStatus.UNAUTHORIZED,
    );
  });
  it('should not delete user does not exist', async () => {
    const createdId: string = '66cf3989243165ced8ca6ad3';

    await userTestManger.deleteUser(
      createdId,
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      HttpStatus.NOT_FOUND,
    );
  });
});
