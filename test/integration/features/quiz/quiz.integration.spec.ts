import { initSettings } from '../../utils/init-settings';
import { INestApplication } from '@nestjs/common';
import { deleteAllData } from '../../../utils/delete-all-data';
import { ResultStatus } from '../../../../src/base/types/object-result';
import { DataSource } from 'typeorm';
import { Question } from '../../../../src/features/quiz/domain/question.entity';
import { QuestionOutputModel } from '../../../../src/features/quiz/api/models/output/question.output.model';
import { QuestionTestManager } from './question-test-manager';

describe('quiz', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let questionTestManager: QuestionTestManager;

  beforeAll(async () => {
    await initSettings();

    app = expect.getState().app;
    dataSource = expect.getState().dataSource;
    questionTestManager = expect.getState().questionTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // await wait(4);
    await deleteAllData(expect.getState().dataSource);
    jest.clearAllMocks();
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
  describe('UpdateQuestionUseCase', () => {
    it('should update question', async () => {
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

      const questionUpdateModel = {
        body: 'body111111111',
        correctAnswers: ['answ1', '1', '1.1'],
      };

      await questionTestManager.update(
        createdId,
        questionUpdateModel.body,
        questionUpdateModel.correctAnswers,
        ResultStatus.Success,
      );

      const updatedQuestion: Question | null = await dataSource
        .getRepository(Question)
        .findOneBy({ id: createdId });

      expect(updatedQuestion).not.toBeNull();
      expect(updatedQuestion?.body).toBe(questionUpdateModel.body);
    });

    it('should not update question: NOT FOUND', async () => {
      const id: number = 555;

      const questionUpdateModel = {
        body: 'body111111111',
        correctAnswers: ['answ1', '1', '1.1'],
      };

      await questionTestManager.update(
        id,
        questionUpdateModel.body,
        questionUpdateModel.correctAnswers,
        ResultStatus.NotFound,
      );
    });
  });
  describe('UpdatePublishedStatusUseCase', () => {
    it('should update question published status', async () => {
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

      const publishedStatus: boolean = true;

      await questionTestManager.updatePublishedStatus(
        createdId,
        publishedStatus,
        ResultStatus.Success,
      );

      const updatedQuestion: Question | null = await dataSource
        .getRepository(Question)
        .findOneBy({ id: createdId });

      expect(updatedQuestion).not.toBeNull();
      expect(updatedQuestion?.published).toBe(publishedStatus);
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
