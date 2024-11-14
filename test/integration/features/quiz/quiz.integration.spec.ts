import { initSettings } from '../../utils/init-settings';
import { INestApplication } from '@nestjs/common';
import { deleteAllData } from '../../../utils/delete-all-data';
import { ResultStatus } from '../../../../src/base/types/object-result';
import { DataSource } from 'typeorm';
import { Question } from '../../../../src/features/quiz/domain/question.entity';
import { QuestionOutputModel } from '../../../../src/features/quiz/api/models/output/question.output.model';
import { QuestionTestManager } from './question-test-manager';
import {
  PaginationOutput,
  PaginationWithBodySearchTermAndPublishedStatus,
} from '../../../../src/base/models/pagination.base.model';
import { QuestionsPaginationQuery } from '../../../../src/features/quiz/api/models/input/questions-pagination-query.input.model';
import { PublishedStatus } from '../../../../src/base/types/published-status';
import { QUESTIONS_SORTING_PROPERTIES } from '../../../../src/features/quiz/api/quiz-sa.controller.ts.controller';
import { UserOutputModel } from '../../../../src/features/users/api/models/output/user.output.model';

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

  describe('GetAllQuestionsUseCase', () => {
    it('should return question with default query values', async () => {
      const createdQuestions: any[] = [];

      for (let i = 0; i < 11; i++) {
        const questionCreateModel = {
          body: `bodybodybodybody${i}`,
          correctAnswers: ['answ${i}', `${i}`, `${i}.1`],
        };

        const createdId: number = await questionTestManager.create(
          questionCreateModel.body,
          questionCreateModel.correctAnswers,
          ResultStatus.Success,
        );

        expect(createdId).toBeDefined();

        createdQuestions.push({
          id: createdId.toString(),
          body: questionCreateModel.body,
          correctAnswers: questionCreateModel.correctAnswers,
          createdAt: new Date().toISOString(),
        });
      }

      const query = {
        // bodySearchTerm: null,
        // publishedStatus: PublishedStatus.ALL,
        // sortBy: 'createdAt',
        // sortDirection: 'ASC',
        // pageNumber: 1,
        // pageSize: 5,
      };

      const pagination: PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery> =
        new PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery>(
          query,
          QUESTIONS_SORTING_PROPERTIES,
        );

      const result: PaginationOutput<QuestionOutputModel> =
        await questionTestManager.getAll(pagination, ResultStatus.Success);

      expect(result).toBeDefined();

      const sortedCreatedQuestions = createdQuestions.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );

      result.items.forEach((q, i) => {
        expect(q).toEqual(
          expect.objectContaining({
            id: sortedCreatedQuestions[i].id,
            body: sortedCreatedQuestions[i].body,
            correctAnswers: sortedCreatedQuestions[i].correctAnswers,
          }),
        );
      });

      expect(result.items.length).toBe(pagination.pageSize);
      expect(result.page).toBe(pagination.pageNumber);
      expect(result.pagesCount).toBe(
        Math.ceil(createdQuestions.length / pagination.pageSize),
      );
      expect(result.pageSize).toBe(pagination.pageSize);
      expect(result.totalCount).toBe(createdQuestions.length);
    });
    it('should return question with set pageNumber and pageSize', async () => {
      const createdQuestions: any[] = [];

      for (let i = 0; i < 11; i++) {
        const questionCreateModel = {
          body: `bodybodybodybody${i}`,
          correctAnswers: ['answ${i}', `${i}`, `${i}.1`],
        };

        const createdId: number = await questionTestManager.create(
          questionCreateModel.body,
          questionCreateModel.correctAnswers,
          ResultStatus.Success,
        );

        expect(createdId).toBeDefined();

        createdQuestions.push({
          id: createdId.toString(),
          body: questionCreateModel.body,
          correctAnswers: questionCreateModel.correctAnswers,
          createdAt: new Date().toISOString(),
        });
      }

      const query = {
        // bodySearchTerm: null,
        // publishedStatus: PublishedStatus.ALL,
        // sortBy: 'createdAt',
        // sortDirection: 'ASC',
        pageNumber: 2,
        pageSize: 3,
      };

      const pagination: PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery> =
        new PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery>(
          query,
          QUESTIONS_SORTING_PROPERTIES,
        );

      const result: PaginationOutput<QuestionOutputModel> =
        await questionTestManager.getAll(pagination, ResultStatus.Success);

      expect(result).toBeDefined();

      const paginatedCreatedQuestions = createdQuestions
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(3, 6);

      result.items.forEach((q, i) => {
        expect(q).toEqual(
          expect.objectContaining({
            id: paginatedCreatedQuestions[i].id,
            body: paginatedCreatedQuestions[i].body,
            correctAnswers: paginatedCreatedQuestions[i].correctAnswers,
          }),
        );
      });

      expect(result.items.length).toBe(pagination.pageSize);
      expect(result.page).toBe(pagination.pageNumber);
      expect(result.pagesCount).toBe(
        Math.ceil(createdQuestions.length / pagination.pageSize),
      );
      expect(result.pageSize).toBe(pagination.pageSize);
      expect(result.totalCount).toBe(createdQuestions.length);
    });
    it('should return question with asc sort direction', async () => {
      const createdQuestions: any[] = [];

      for (let i = 0; i < 11; i++) {
        const questionCreateModel = {
          body: `bodybodybodybody${i}`,
          correctAnswers: ['answ${i}', `${i}`, `${i}.1`],
        };

        const createdId: number = await questionTestManager.create(
          questionCreateModel.body,
          questionCreateModel.correctAnswers,
          ResultStatus.Success,
        );

        expect(createdId).toBeDefined();

        createdQuestions.push({
          id: createdId.toString(),
          body: questionCreateModel.body,
          correctAnswers: questionCreateModel.correctAnswers,
          createdAt: new Date().toISOString(),
        });
      }

      const query = {
        // bodySearchTerm: null,
        // publishedStatus: PublishedStatus.ALL,
        // sortBy: 'createdAt',
        sortDirection: 'asc',
        // pageNumber: 1,
        // pageSize: 5,
      };

      const pagination: PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery> =
        new PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery>(
          query,
          QUESTIONS_SORTING_PROPERTIES,
        );

      const result: PaginationOutput<QuestionOutputModel> =
        await questionTestManager.getAll(pagination, ResultStatus.Success);

      expect(result).toBeDefined();

      // const sortedCreatedQuestions = createdQuestions.sort((a, b) =>
      //   b.createdAt.localeCompare(a.createdAt),
      // );

      result.items.forEach((q, i) => {
        expect(q).toEqual(
          expect.objectContaining({
            id: createdQuestions[i].id,
            body: createdQuestions[i].body,
            correctAnswers: createdQuestions[i].correctAnswers,
          }),
        );
      });

      expect(result.items.length).toBe(pagination.pageSize);
      expect(result.page).toBe(pagination.pageNumber);
      expect(result.pagesCount).toBe(
        Math.ceil(createdQuestions.length / pagination.pageSize),
      );
      expect(result.pageSize).toBe(pagination.pageSize);
      expect(result.totalCount).toBe(createdQuestions.length);
    });
    it('should return question with sorting by body', async () => {
      const createdQuestions: any[] = [];

      for (let i = 0; i < 11; i++) {
        const questionCreateModel = {
          body: `bodybodybodybody${i}`,
          correctAnswers: ['answ${i}', `${i}`, `${i}.1`],
        };

        const createdId: number = await questionTestManager.create(
          questionCreateModel.body,
          questionCreateModel.correctAnswers,
          ResultStatus.Success,
        );

        expect(createdId).toBeDefined();

        createdQuestions.push({
          id: createdId.toString(),
          body: questionCreateModel.body,
          correctAnswers: questionCreateModel.correctAnswers,
          createdAt: new Date().toISOString(),
        });
      }

      const query = {
        // bodySearchTerm: null,
        // publishedStatus: PublishedStatus.ALL,
        sortBy: 'body',
        // sortDirection: 'ASC',
        // pageNumber: 1,
        // pageSize: 5,
      };

      const pagination: PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery> =
        new PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery>(
          query,
          QUESTIONS_SORTING_PROPERTIES,
        );

      const result: PaginationOutput<QuestionOutputModel> =
        await questionTestManager.getAll(pagination, ResultStatus.Success);

      expect(result).toBeDefined();

      const sortedCreatedQuestions = createdQuestions.sort((a, b) =>
        b.body.localeCompare(a.body),
      );

      result.items.forEach((q, i) => {
        expect(q).toEqual(
          expect.objectContaining({
            id: sortedCreatedQuestions[i].id,
            body: sortedCreatedQuestions[i].body,
            correctAnswers: sortedCreatedQuestions[i].correctAnswers,
          }),
        );
      });

      expect(result.items.length).toBe(pagination.pageSize);
      expect(result.page).toBe(pagination.pageNumber);
      expect(result.pagesCount).toBe(
        Math.ceil(createdQuestions.length / pagination.pageSize),
      );
      expect(result.pageSize).toBe(pagination.pageSize);
      expect(result.totalCount).toBe(createdQuestions.length);
    });
    it('should return question with sorting by body asc', async () => {
      const createdQuestions: any[] = [];

      for (let i = 0; i < 11; i++) {
        const questionCreateModel = {
          body: `bodybodybodybody${i}`,
          correctAnswers: ['answ${i}', `${i}`, `${i}.1`],
        };

        const createdId: number = await questionTestManager.create(
          questionCreateModel.body,
          questionCreateModel.correctAnswers,
          ResultStatus.Success,
        );

        expect(createdId).toBeDefined();

        createdQuestions.push({
          id: createdId.toString(),
          body: questionCreateModel.body,
          correctAnswers: questionCreateModel.correctAnswers,
          createdAt: new Date().toISOString(),
        });
      }

      const query = {
        // bodySearchTerm: null,
        // publishedStatus: PublishedStatus.ALL,
        sortBy: 'body',
        sortDirection: 'asc',
        // pageNumber: 1,
        // pageSize: 5,
      };

      const pagination: PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery> =
        new PaginationWithBodySearchTermAndPublishedStatus<QuestionsPaginationQuery>(
          query,
          QUESTIONS_SORTING_PROPERTIES,
        );

      const result: PaginationOutput<QuestionOutputModel> =
        await questionTestManager.getAll(pagination, ResultStatus.Success);

      expect(result).toBeDefined();

      const sortedCreatedQuestions = createdQuestions.sort((a, b) =>
        a.body.localeCompare(b.body),
      );

      result.items.forEach((q, i) => {
        expect(q).toEqual(
          expect.objectContaining({
            id: sortedCreatedQuestions[i].id,
            body: sortedCreatedQuestions[i].body,
            correctAnswers: sortedCreatedQuestions[i].correctAnswers,
          }),
        );
      });

      expect(result.items.length).toBe(pagination.pageSize);
      expect(result.page).toBe(pagination.pageNumber);
      expect(result.pagesCount).toBe(
        Math.ceil(createdQuestions.length / pagination.pageSize),
      );
      expect(result.pageSize).toBe(pagination.pageSize);
      expect(result.totalCount).toBe(createdQuestions.length);
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
