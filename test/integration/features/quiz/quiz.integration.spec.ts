import { initSettings } from '../../utils/init-settings';
import { INestApplication } from '@nestjs/common';
import {
  CreateQuestionCommand,
  CreateQuestionUseCase,
} from '../../../../src/features/quiz/application/use-cases/create-question.usecase';
import { deleteAllData } from '../../../utils/delete-all-data';
import { Result, ResultStatus } from '../../../../src/base/types/object-result';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionsTypeormRepository } from '../../../../src/features/quiz/infrastructure/questions-typeorm.repository';
import { DataSource } from 'typeorm';
import { Question } from '../../../../src/features/quiz/domain/question.entity';

describe('quiz', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createQuestionUseCase: CreateQuestionUseCase;
  let questionsRepository: QuestionsTypeormRepository;

  beforeAll(async () => {
    await initSettings();

    app = expect.getState().app;
    dataSource = expect.getState().dataSource;

    createQuestionUseCase = app.get<CreateQuestionUseCase>(
      CreateQuestionUseCase,
    );
    questionsRepository = app.get<QuestionsTypeormRepository>(
      QuestionsTypeormRepository,
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

  it('should successfully create question', async () => {
    const questionCreateModel = {
      body: 'bodybodybodybodybody',
      correctAnswers: ['answ1', '1', '1.1'],
    };

    const command: CreateQuestionCommand = new CreateQuestionCommand(
      questionCreateModel.body,
      questionCreateModel.correctAnswers,
    );

    const result: Result<number> = await createQuestionUseCase.execute(command);

    expect(result.status).toBe(ResultStatus.Success);
    expect(result.data).toBeDefined();

    const savedQuestion: Question | null = await dataSource
      .getRepository(Question)
      .findOneBy({ id: result.data });

    // console.log('savedQuestion', savedQuestion);

    expect(savedQuestion?.body).toBe(questionCreateModel.body);
    expect(savedQuestion?.correctAnswers).toEqual(
      questionCreateModel.correctAnswers,
    );
  });
});
