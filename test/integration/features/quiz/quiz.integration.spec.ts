import { initSettings } from '../../utils/init-settings';
import { INestApplication } from '@nestjs/common';
import { CreateQuestionUseCase } from '../../../../src/features/quiz/application/commands/create-question.command';
import { deleteAllData } from '../../../utils/delete-all-data';
import { Result, ResultStatus } from '../../../../src/base/types/object-result';
import { DataSource } from 'typeorm';
import { Question } from '../../../../src/features/quiz/domain/question.entity';
import {
  GetQuestionQuery,
  GetQuestionUseCase,
} from '../../../../src/features/quiz/application/queries/get-question.query';
import { QuestionOutputModel } from '../../../../src/features/quiz/api/models/output/question.output.model';
import {
  DeleteQuestionCommand,
  DeleteQuestionUseCase,
} from '../../../../src/features/quiz/application/commands/delete-question.command';
import { QuestionTestManager } from './question-test-manager';

describe('quiz', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createQuestionUseCase: CreateQuestionUseCase;
  let getQuestionUseCase: GetQuestionUseCase;
  let deleteQuestionUseCase: DeleteQuestionUseCase;

  let questionTestManager: QuestionTestManager;

  beforeAll(async () => {
    await initSettings();

    app = expect.getState().app;
    dataSource = expect.getState().dataSource;
    questionTestManager = expect.getState().questionTestManger;

    createQuestionUseCase = app.get<CreateQuestionUseCase>(
      CreateQuestionUseCase,
    );
    getQuestionUseCase = app.get<GetQuestionUseCase>(GetQuestionUseCase);
    deleteQuestionUseCase = app.get<DeleteQuestionUseCase>(
      DeleteQuestionUseCase,
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

  describe('CreateQuestionUseCase', () => {
    it('should successfully create question', async () => {
      const questionCreateModel = {
        body: 'bodybodybodybodybody',
        correctAnswers: ['answ1', '1', '1.1'],
      };

      const createdId: number = await questionTestManager.create(
        questionCreateModel.body,
        questionCreateModel.correctAnswers,
        ResultStatus.Success,
      );

      expect(createdId).toBeDefined();

      const savedQuestion: Question | null = await dataSource
        .getRepository(Question)
        .findOneBy({ id: createdId });

      expect(savedQuestion).not.toBeNull();
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

      const createdId: number = await questionTestManager.create(
        questionCreateModel.body,
        questionCreateModel.correctAnswers,
        ResultStatus.Success,
      );

      expect(createdId).toBeDefined();

      const question: QuestionOutputModel | null =
        await questionTestManager.getOne(createdId, ResultStatus.Success);

      expect(question?.body).toBe(questionCreateModel.body);
      expect(question?.correctAnswers).toEqual(
        questionCreateModel.correctAnswers,
      );
    });

    it('should return null if the question is not found', async () => {
      const questionId: number = 555;

      const question: QuestionOutputModel | null =
        await questionTestManager.getOne(questionId, ResultStatus.Success);

      expect(question).toBeNull();
    });
  });
  describe('DeleteQuestionUseCase', () => {
    it('should delete question', async () => {
      const questionCreateModel = {
        body: 'bodybodybodybodybody',
        correctAnswers: ['answ1', '1', '1.1'],
      };

      const createdId: number = await questionTestManager.create(
        questionCreateModel.body,
        questionCreateModel.correctAnswers,
        ResultStatus.Success,
      );

      expect(createdId).toBeDefined();

      await questionTestManager.delete(createdId, ResultStatus.Success);

      const deletedQuestion: Question | null = await dataSource
        .getRepository(Question)
        .findOneBy({ id: createdId });

      expect(deletedQuestion).toBeNull();
    });

    it('should not delete question: NOT FOUND', async () => {
      const id: number = 555;

      await questionTestManager.delete(id, ResultStatus.NotFound);
    });
  });
});
