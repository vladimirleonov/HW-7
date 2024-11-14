import { INestApplication } from '@nestjs/common';
import { RegistrationModel } from '../../../../src/features/auth/auth/api/models/input/registration.input.model';
import request from 'supertest';
import { ConfirmRegistrationModel } from '../../../../src/features/auth/auth/api/models/input/confirm-registration.model';
import { RegistrationEmailResendingModel } from '../../../../src/features/auth/auth/api/models/input/registration-email-resending.model';
import { PasswordRecoveryModel } from '../../../../src/features/auth/auth/api/models/input/password-recovery.model';
import { NewPasswordModel } from '../../../../src/features/auth/auth/api/models/input/new-password.model';
import { LoginModel } from '../../../../src/features/auth/auth/api/models/input/login.input.model';
import {
  CreateQuestionCommand,
  CreateQuestionUseCase,
} from '../../../../src/features/quiz/application/commands/create-question.command';
import { QuestionCreateModel } from '../../../../src/features/quiz/api/models/input/create-question.input.model';
import { Result, ResultStatus } from '../../../../src/base/types/object-result';
import {
  GetQuestionQuery,
  GetQuestionUseCase,
} from '../../../../src/features/quiz/application/queries/get-question.query';
import { QuestionOutputModel } from '../../../../src/features/quiz/api/models/output/question.output.model';
import {
  DeleteQuestionCommand,
  DeleteQuestionUseCase,
} from '../../../../src/features/quiz/application/commands/delete-question.command';
import {
  UpdateQuestionCommand,
  UpdateQuestionUseCase,
} from '../../../../src/features/quiz/application/commands/update-question.command';
import {
  UpdatePublishedStatusCommand,
  UpdatePublishedStatusUseCase,
} from '../../../../src/features/quiz/application/commands/update-published-status.command';
import {
  PaginationOutput,
  PaginationWithBodySearchTermAndPublishedStatus,
} from '../../../../src/base/models/pagination.base.model';
import { QuestionsPaginationQuery } from '../../../../src/features/quiz/api/models/input/questions-pagination-query.input.model';
import {
  GetAllQuestionsQuery,
  GetAllQuestionsUseCase,
} from '../../../../src/features/quiz/application/queries/get-all-questions.query';

export class QuestionTestManager {
  constructor(protected readonly app: INestApplication) {}

  async getAll(
    pagination: PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery>,
    expectedStatus: ResultStatus,
  ): Promise<PaginationOutput<QuestionOutputModel>> {
    const query: GetAllQuestionsQuery = new GetAllQuestionsQuery(pagination);

    const getAllQuestionsUseCase: GetAllQuestionsUseCase =
      this.app.get<GetAllQuestionsUseCase>(GetAllQuestionsUseCase);

    const result: Result<PaginationOutput<QuestionOutputModel>> =
      await getAllQuestionsUseCase.execute(query);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async getOne(
    id: number,
    expectedStatus: ResultStatus,
  ): Promise<QuestionOutputModel | null> {
    const query: GetQuestionQuery = new GetQuestionQuery(id);

    const getQuestionUseCase: GetQuestionUseCase =
      this.app.get<GetQuestionUseCase>(GetQuestionUseCase);

    const result: Result<QuestionOutputModel | null> =
      await getQuestionUseCase.execute(query);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async create(
    body: string,
    correctAnswers: string[],
    expectedStatus: ResultStatus,
  ): Promise<number> {
    const command: CreateQuestionCommand = new CreateQuestionCommand(
      body,
      correctAnswers,
    );

    const createQuestionUseCase: CreateQuestionUseCase =
      this.app.get<CreateQuestionUseCase>(CreateQuestionUseCase);

    const result: Result<number> = await createQuestionUseCase.execute(command);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async update(
    id: number,
    body: string,
    correctAnswers: string[],
    expectedStatus: ResultStatus,
  ): Promise<void> {
    const command: UpdateQuestionCommand = new UpdateQuestionCommand(
      id,
      body,
      correctAnswers,
    );

    const updateQuestionUseCase: UpdateQuestionUseCase =
      this.app.get<UpdateQuestionUseCase>(UpdateQuestionUseCase);

    const result: Result = await updateQuestionUseCase.execute(command);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to update question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }
  }

  async updatePublishedStatus(
    id: number,
    published: boolean,
    expectedStatus: ResultStatus,
  ): Promise<void> {
    const command: UpdatePublishedStatusCommand =
      new UpdatePublishedStatusCommand(id, published);

    const updatePublishedStatusUseCase: UpdatePublishedStatusUseCase =
      this.app.get<UpdatePublishedStatusUseCase>(UpdatePublishedStatusUseCase);

    const result: Result = await updatePublishedStatusUseCase.execute(command);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to update question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }
  }

  async delete(id: number, expectedStatus: ResultStatus): Promise<void> {
    const deleteCommand: DeleteQuestionCommand = new DeleteQuestionCommand(id);

    const deleteQuestionUseCase: DeleteQuestionUseCase =
      this.app.get<DeleteQuestionUseCase>(DeleteQuestionUseCase);

    const result: Result = await deleteQuestionUseCase.execute(deleteCommand);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }
  }

  // async loginWithRefreshToken(
  //   loginModel: LoginModel,
  //   statusCode: number = 200,
  //   refreshToken = null,
  // ) {
  //   const requestBuilder = request(this.app.getHttpServer())
  //     .post('/api/auth/login')
  //     .expect(statusCode);
  //
  //   if (refreshToken) {
  //     requestBuilder.set('Cookie', `refreshToken=${refreshToken}`);
  //   }
  //
  //   return requestBuilder;
  // }
  //
  // async refreshToken(refreshToken: string, statusCode: number = 200) {
  //   return request(this.app.getHttpServer())
  //     .post('/api/auth/refresh-token')
  //     .set('Cookie', `refreshToken=${refreshToken}`)
  //     .expect(statusCode);
  // }
}
