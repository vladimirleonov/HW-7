import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../utils/init-settings';
import { UsersTestManager } from './users-test-manager';
import { UserCreateModel } from '../../../../src/features/users/api/models/input/create-user.input.model';
import { deleteAllData } from '../../utils/delete-all-data';
import { UserOutputModel } from '../../../../src/features/users/api/models/output/user.output.model';

const TEST_ADMIN_CREDENTIALS = {
  login: 'admin',
  password: 'qwerty',
};

describe('users', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    await initSettings();
    // await initSettings((moduleBuilder) =>
    //   //override UsersService еще раз
    //   moduleBuilder.overrideProvider(UsersService).useFactory({
    //     factory: (repo: UsersMongoRepository, authService: AuthService) => {
    //       return new UserServiceMock(repo, authService);
    //     },
    //     inject: [UsersMongoRepository, AuthService],
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
      HttpStatus.CREATED,
    );

    expect(response.body).toEqual({
      login: body.login,
      email: body.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('should not  create user unauthorized', async () => {
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

  it('should not create user short login', async () => {
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

  it('should not create user short password', async () => {
    const body: UserCreateModel = {
      login: 'name1',
      password: 'qwer',
      email: 'email@email.com',
    };

    await userTestManger.createUser(
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      body,
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should not create user incorrect email format', async () => {
    const body: UserCreateModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'emailemail.com',
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

  it('should not delete user incorrect id format', async () => {
    const createdId: string = '123456';

    await userTestManger.deleteUser(
      createdId,
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      HttpStatus.BAD_REQUEST,
    );
  });

  // get
  it('should not get users unauthorized', async () => {
    await userTestManger.getUsers(
      'test',
      TEST_ADMIN_CREDENTIALS.password,
      HttpStatus.UNAUTHORIZED,
    );
  });

  it('should get sorted users by default', async () => {
    const users: UserOutputModel[] = [];
    const count = 3;

    for (let i = 0; i < count; i++) {
      const body: UserCreateModel = {
        login: `test${i}`,
        password: 'qwerty',
        email: `test${i}@gmail.com`,
      };

      const response = await userTestManger.createUser(
        TEST_ADMIN_CREDENTIALS.login,
        TEST_ADMIN_CREDENTIALS.password,
        body,
        HttpStatus.CREATED,
      );

      users.push({
        id: response.body.id,
        login: response.body.login,
        email: response.body.email,
        createdAt: response.body.createdAt,
      });
    }

    //sort by default
    const sortedUsers: UserOutputModel[] = users.sort(
      (a: UserOutputModel, b: UserOutputModel) =>
        b.createdAt.localeCompare(a.createdAt),
    );

    const response = await userTestManger.getUsers(
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      HttpStatus.OK,
    );

    expect(response.body.items).toEqual(sortedUsers);
  });

  it('should get sorted users sort direction asc', async () => {
    const users: UserOutputModel[] = [];
    const count = 3;
    const sortBy: string = 'login';
    const sortDirection: string = 'asc';

    for (let i = 0; i < count; i++) {
      const body: UserCreateModel = {
        login: `test${i}`,
        password: 'qwerty',
        email: `test${i}@gmail.com`,
      };

      const response = await userTestManger.createUser(
        TEST_ADMIN_CREDENTIALS.login,
        TEST_ADMIN_CREDENTIALS.password,
        body,
        HttpStatus.CREATED,
      );

      users.push({
        id: response.body.id,
        login: response.body.login,
        email: response.body.email,
        createdAt: response.body.createdAt,
      });
    }

    //sort by default
    const sortedUsers: UserOutputModel[] = users.sort(
      (a: UserOutputModel, b: UserOutputModel) =>
        a.createdAt.localeCompare(b.createdAt),
    );

    const response = await userTestManger.getUsers(
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      HttpStatus.OK,
      sortBy,
      sortDirection,
    );

    expect(response.body.items).toEqual(sortedUsers);
  });

  it('should get users with pagination', async () => {
    const users: UserOutputModel[] = [];
    const count = 6;
    const pageNumber: number = 2;
    const pageSize: number = 3;

    for (let i = 0; i < count; i++) {
      const body: UserCreateModel = {
        login: `test${i}`,
        password: 'qwerty',
        email: `test${i}@gmail.com`,
      };

      const response = await userTestManger.createUser(
        TEST_ADMIN_CREDENTIALS.login,
        TEST_ADMIN_CREDENTIALS.password,
        body,
        HttpStatus.CREATED,
      );

      users.push({
        id: response.body.id,
        login: response.body.login,
        email: response.body.email,
        createdAt: response.body.createdAt,
      });
    }

    // sort by default
    const sortedUsers: UserOutputModel[] = users.sort(
      (a: UserOutputModel, b: UserOutputModel) =>
        b.createdAt.localeCompare(a.createdAt),
    );

    // paginated users
    const paginatedPosts: UserOutputModel[] = sortedUsers.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize,
    );

    const response = await userTestManger.getUsers(
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      HttpStatus.OK,
      undefined,
      undefined,
      pageNumber,
      pageSize,
    );

    expect(response.body.items).toEqual(paginatedPosts);
  });
});
