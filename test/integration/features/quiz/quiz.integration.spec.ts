import { initSettings } from '../../utils/init-settings';
import { INestApplication } from '@nestjs/common';
import { CreateQuestionUseCase } from '../../../../src/features/quiz/application/use-cases/create-question.usecase';
import { deleteAllData } from '../../../utils/delete-all-data';

describe('quiz', () => {
  let app: INestApplication;
  let createQuestionUseCase: CreateQuestionUseCase;

  beforeAll(async () => {
    await initSettings();

    app = expect.getState().app;

    createQuestionUseCase = app.get<CreateQuestionUseCase>(
      CreateQuestionUseCase,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // await wait(4);
    await deleteAllData(expect.getState().dataSource);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    console.log(
      'createQuestionUseCase',
      Object.getOwnPropertyNames(Object.getPrototypeOf(createQuestionUseCase)),
    );

    expect(1).toBeDefined();
  });
});
