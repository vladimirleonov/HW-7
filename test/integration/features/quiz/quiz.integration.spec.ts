import { initSettings } from '../../utils/init-settings';
import { INestApplication } from '@nestjs/common';
import {
  CreateQuestionCommand,
  CreateQuestionUseCase,
} from '../../../../src/features/quiz/application/commands/create-question.command';
import { deleteAllData } from '../../../utils/delete-all-data';
import { Result, ResultStatus } from '../../../../src/base/types/object-result';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionsTypeormRepository } from '../../../../src/features/quiz/infrastructure/questions-typeorm.repository';
import { DataSource } from 'typeorm';
import { Question } from '../../../../src/features/quiz/domain/question.entity';
import {
  GetQuestionQuery,
  GetQuestionUseCase,
} from '../../../../src/features/quiz/application/queries/get-question.query';
import { QuestionOutputModel } from '../../../../src/features/quiz/api/models/output/question.output.model';

describe('quiz', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createQuestionUseCase: CreateQuestionUseCase;
  let getQuestionUseCase: GetQuestionUseCase;

  beforeAll(async () => {
    await initSettings();

    app = expect.getState().app;
    dataSource = expect.getState().dataSource;

    createQuestionUseCase = app.get<CreateQuestionUseCase>(
      CreateQuestionUseCase,
    );
    getQuestionUseCase = app.get<GetQuestionUseCase>(GetQuestionUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // await wait(4);
    await deleteAllData(expect.getState().dataSource);
    jest.clearAllMocks();
  });

  describe('CreateQuestionUseCase', () => {
    it('should successfully create question', async () => {
      const questionCreateModel = {
        body: 'bodybodybodybodybody',
        correctAnswers: ['answ1', '1', '1.1'],
      };

      const command: CreateQuestionCommand = new CreateQuestionCommand(
        questionCreateModel.body,
        questionCreateModel.correctAnswers,
      );

      const result: Result<number> =
        await createQuestionUseCase.execute(command);

      const createdId: number = result.data;

      expect(result.status).toBe(ResultStatus.Success);
      expect(result.data).toBeDefined();

      const savedQuestion: Question | null = await dataSource
        .getRepository(Question)
        .findOneBy({ id: createdId });

      // console.log('savedQuestion', savedQuestion);

      expect(savedQuestion?.body).toBe(questionCreateModel.body);
      expect(savedQuestion?.correctAnswers).toEqual(
        questionCreateModel.correctAnswers,
      );
    });
  });
  describe('GetQuestionQuery', () => {
    it('should return the question by ID', async () => {
      const questionCreateModel = {
        body: 'bodybodybodybodybody',
        correctAnswers: ['answ1', '1', '1.1'],
      };

      const command: CreateQuestionCommand = new CreateQuestionCommand(
        questionCreateModel.body,
        questionCreateModel.correctAnswers,
      );

      const createResult: Result<number> =
        await createQuestionUseCase.execute(command);

      expect(createResult.status).toBe(ResultStatus.Success);
      expect(createResult.data).toBeDefined();

      const createdId: number = createResult.data;

      const query: GetQuestionQuery = new GetQuestionQuery(createdId);

      const getResult: Result<QuestionOutputModel | null> =
        await getQuestionUseCase.execute(query);

      console.log(getResult);

      expect(getResult.data?.body).toBe(questionCreateModel.body);
      expect(getResult.data?.correctAnswers).toEqual(
        questionCreateModel.correctAnswers,
      );
    });

    it('should return null if the question is not found', async () => {
      const questionId: number = 555;

      const query: GetQuestionQuery = new GetQuestionQuery(questionId);

      const getResult: Result<QuestionOutputModel | null> =
        await getQuestionUseCase.execute(query);

      expect(getResult.data).toBeNull();
    });
  });
});
