import { INestApplication } from '@nestjs/common';
import {
  Result,
  ResultStatus,
} from '../../../../../src/base/types/object-result';
import {
  CreateUserCommand,
  CreateUserUseCase,
} from '../../../../../src/features/users/application/use-cases/create-user.usecase';
import {
  LoginCommand,
  LoginUseCase,
} from '../../../../../src/features/auth/auth/application/use-cases/login.usecase';

export class UsersTestManager {
  constructor(protected readonly app: INestApplication) {}

  async create(
    login: string,
    password: string,
    email: string,
    expectedStatus: ResultStatus,
  ): Promise<number | null> {
    const command: CreateUserCommand = new CreateUserCommand(
      login,
      password,
      email,
    );

    const createQuestionUseCase: CreateUserUseCase =
      this.app.get<CreateUserUseCase>(CreateUserUseCase);

    const result: Result<null> | Result<number> =
      await createQuestionUseCase.execute(command);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async login(
    userId: number,
    ip: string,
    deviceName: string,
    refreshToken: string,
    expectedStatus: ResultStatus,
  ): Promise<null | { accessToken: string; refreshToken: string }> {
    const command: LoginCommand = new LoginCommand(
      userId,
      ip,
      deviceName,
      refreshToken,
    );

    const loginUseCase: LoginUseCase = this.app.get<LoginUseCase>(LoginUseCase);

    const result: Result<null | { accessToken: string; refreshToken: string }> =
      await loginUseCase.execute(command);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async generateUsers(count: number): Promise<
    {
      login: string;
      email: string;
      password: string;
    }[]
  > {
    const users: {
      login: string;
      email: string;
      password: string;
    }[] = [];

    for (let i: number = 0; i < count; i++) {
      const user = {
        login: `name${i}`,
        password: `qwerty${i}`,
        email: `email${i}@email.com`,
      };

      users.push(user);
    }

    return users;
  }
}
