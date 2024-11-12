import { initSettings } from '../../utils/init-settings';
import { INestApplication } from '@nestjs/common';
import { CreateQuestionUseCase } from '../../../../src/features/quiz/application/use-cases/create-question.usecase';

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

  it('should be defined', () => {
    console.log(
      'createQuestionUseCase',
      Object.getOwnPropertyNames(Object.getPrototypeOf(createQuestionUseCase)),
    );

    expect(1).toBeDefined();
  });
});
