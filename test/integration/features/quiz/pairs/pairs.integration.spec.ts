import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PairsTestManager } from './pairs-test-manager';
import { initSettings } from '../../../utils/init-settings';
import { deleteAllData } from '../../../../utils/delete-all-data';
import { UsersTestManager } from './users-test-manager';
import { ResultStatus } from '../../../../../src/base/types/object-result';
import {
  Game,
  GameStatus,
} from '../../../../../src/features/quiz/domain/game.entity';
import { GameTypeormRepository } from '../../../../../src/features/quiz/infrastructure/game/game-typeorm.repository';
import { QuestionTestManager } from '../question/question-test-manager';
import { GameOutputModel } from '../../../../../src/features/quiz/api/models/output/game.output.model';
import {
  Pagination,
  PaginationOutput,
  PaginationWithScores,
} from '../../../../../src/base/models/pagination.base.model';
import { GAME_SORTING_PROPERTIES } from '../../../../../src/features/quiz/api/pairs.controller';
import { UserStatisticOutputModel } from '../../../../../src/features/quiz/api/models/output/my-statistic.output.model';
import {
  MultiSortQueryParams,
  PaginationQueryParams,
} from '../../../../../src/base/models/pagination-query.input.model';
import { TOP_USERS_SORTING_PROPERTIES } from '../../../../../src/features/quiz/api/users.controller';
import { TopUserOutputModel } from '../../../../../src/features/quiz/api/models/output/top-user.output.model';

describe('pairs', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let pairsTestManager: PairsTestManager;
  let usersTestManager: UsersTestManager;
  let questionTestManager: QuestionTestManager;

  beforeAll(async () => {
    await initSettings();

    app = expect.getState().app;
    dataSource = expect.getState().dataSource;
    pairsTestManager = expect.getState().pairsTestManager;
    usersTestManager = expect.getState().usersTestManager;
    questionTestManager = expect.getState().questionTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // await wait(4);
    await deleteAllData(expect.getState().dataSource);
    jest.clearAllMocks();
  });

  describe('GetTopUsersUseCase', () => {
    it('should successfully return top users with default pagination', async () => {
      /**
       * generate questions
       */

      const questions: { body: string; correctAnswers: string[] }[] =
        await questionTestManager.generateQuestions(10);

      /**
       * create and publish questions
       */

      const createdQuestionIds: number[] =
        await questionTestManager.createAndPublishQuestions(
          questions,
          ResultStatus.Success,
        );

      expect(createdQuestionIds).toHaveLength(10);

      /**
       * generate users
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = await usersTestManager.generateUsers(2);

      /**
       * create users
       */

      const userIds: number[] = [];
      for (const user of users) {
        const userId: number | null = await usersTestManager.create(
          user.login,
          user.password,
          user.email,
          ResultStatus.Success,
        );

        expect(userId).not.toBeNull();

        if (userId === null) {
          throw new Error('createResult is null, cannot proceed with the test');
        }

        userIds.push(userId);
      }

      const [firstCreatedId, secondCreatedId] = userIds;

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult).not.toBeNull();

      if (createFirstConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * connect second user to existing pair
       */

      // playerId
      const createSecondConnectionResult: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult).not.toBeNull();

      if (createSecondConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult2: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult2).not.toBeNull();

      if (createFirstConnectionResult2 === null) {
        throw new Error(
          'createFirst2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * connect second user to existing new pair
       */

      // playerId
      const createSecondConnectionResult2: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult2).not.toBeNull();

      if (createSecondConnectionResult2 === null) {
        throw new Error(
          'createSecond2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers2: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult3: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult3).not.toBeNull();

      if (createFirstConnectionResult3 === null) {
        throw new Error(
          'createFirst2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * connect second user to existing new pair
       */

      // playerId
      const createSecondConnectionResult3: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult3).not.toBeNull();

      if (createSecondConnectionResult3 === null) {
        throw new Error(
          'createSecond2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers3: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-1-1-1-0 = 4
       * su 1-0-1-0-1 + 1(first answered) = 4
       * draw
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[1].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[3].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * get top users:
       * two users
       * tree games
       * first lose 2
       * draw 1
       */

      const query = {
        // sort: 'status',
        // pageNumber: 1,
        // pageSize: 10,
      };

      const pagination: PaginationWithScores<MultiSortQueryParams> =
        new PaginationWithScores(query, TOP_USERS_SORTING_PROPERTIES);

      // console.log('pagination', pagination);

      const result: PaginationOutput<TopUserOutputModel> =
        await pairsTestManager.getTopUsers(pagination, ResultStatus.Success);

      // console.log('result', result);

      // manual sorting

      type SortField<T> = { field: keyof T; direction: 'ASC' | 'DESC' };

      function sortItemsManually<T>(
        items: T[],
        sortFields: SortField<T>[], // Ограничиваем поля ключами модели
      ): T[] {
        return [...items].sort((a, b) => {
          for (const { field, direction } of sortFields) {
            const aValue = Number(a[field]) || 0; // Преобразуем к числу
            const bValue = Number(b[field]) || 0;

            if (aValue !== bValue) {
              return direction === 'ASC' ? aValue - bValue : bValue - aValue;
            }
          }
          return 0; // If all fields the same
        });
      }

      // Calling the sort function with an explicitly typed sort field
      const manuallySortedItems = sortItemsManually(
        result.items,
        pagination.sort as SortField<TopUserOutputModel>[],
      );

      // Comparison of results
      expect(result.items).toEqual(manuallySortedItems);

      // Pagination meta information verification
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalCount).toBe(2);
      expect(result.pagesCount).toBe(1);
    });

    it('should successfully return top users with specific pagination', async () => {
      /**
       * generate questions
       */

      const questions: { body: string; correctAnswers: string[] }[] =
        await questionTestManager.generateQuestions(10);

      /**
       * create and publish questions
       */

      const createdQuestionIds: number[] =
        await questionTestManager.createAndPublishQuestions(
          questions,
          ResultStatus.Success,
        );

      expect(createdQuestionIds).toHaveLength(10);

      /**
       * generate users
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = await usersTestManager.generateUsers(4);

      /**
       * create users
       */

      const userIds: number[] = [];
      for (const user of users) {
        const userId: number | null = await usersTestManager.create(
          user.login,
          user.password,
          user.email,
          ResultStatus.Success,
        );

        expect(userId).not.toBeNull();

        if (userId === null) {
          throw new Error('createResult is null, cannot proceed with the test');
        }

        userIds.push(userId);
      }

      const [firstCreatedId, secondCreatedId, thirdCreatedId, fourthCreatedId] =
        userIds;

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult).not.toBeNull();

      if (createFirstConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * connect second user to existing pair
       */

      // playerId
      const createSecondConnectionResult: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult).not.toBeNull();

      if (createSecondConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult2: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult2).not.toBeNull();

      if (createFirstConnectionResult2 === null) {
        throw new Error(
          'createFirst2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * connect second user to existing new pair
       */

      // playerId
      const createSecondConnectionResult2: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult2).not.toBeNull();

      if (createSecondConnectionResult2 === null) {
        throw new Error(
          'createSecond2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers2: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * create new pair with third user
       */

      // playerId
      const createThirdConnectionResult: number | null =
        await pairsTestManager.createConnection(
          thirdCreatedId,
          ResultStatus.Success,
        );

      expect(createThirdConnectionResult).not.toBeNull();

      if (createThirdConnectionResult === null) {
        throw new Error(
          'createThirdConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * connect fourth user to existing new pair
       */

      // playerId
      const createFourthConnectionResult: number | null =
        await pairsTestManager.createConnection(
          fourthCreatedId,
          ResultStatus.Success,
        );

      expect(createFourthConnectionResult).not.toBeNull();

      if (createFourthConnectionResult === null) {
        throw new Error(
          'createFourthConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers3: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          thirdCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-1-1-1-1 + 1(first answered) = 6
       * su 1-0-1-0-1 = 3
       * first win
       */

      // third

      await pairsTestManager.answerAndCheckSuccess(
        thirdCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        thirdCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[1].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        thirdCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        thirdCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[3].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        thirdCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[4].answers[0],
      );

      // fourth

      await pairsTestManager.answerAndCheckSuccess(
        fourthCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        fourthCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        fourthCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        fourthCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        fourthCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[4].answers[0],
      );

      /**
       * get top users:
       * four users
       * six players
       * tree games
       * first lose 2
       * third win 1
       */

      const query = {
        sort: [
          'avgScores desc',
          'sumScore desc',
          'winsCount desc',
          'lossesCount asc',
        ],
        pageNumber: 1,
        pageSize: 2,
      };

      const pagination: PaginationWithScores<MultiSortQueryParams> =
        new PaginationWithScores(query, TOP_USERS_SORTING_PROPERTIES);

      const result: PaginationOutput<TopUserOutputModel> =
        await pairsTestManager.getTopUsers(pagination, ResultStatus.Success);

      // manual sorting

      type SortField<T> = { field: keyof T; direction: 'ASC' | 'DESC' };

      function sortItemsManually<T>(
        items: T[],
        sortFields: SortField<T>[], // Ограничиваем поля ключами модели
      ): T[] {
        return [...items].sort((a, b) => {
          for (const { field, direction } of sortFields) {
            const aValue = Number(a[field]) || 0; // Преобразуем к числу
            const bValue = Number(b[field]) || 0;

            if (aValue !== bValue) {
              return direction === 'ASC' ? aValue - bValue : bValue - aValue;
            }
          }
          return 0; // If all fields the same
        });
      }

      // Calling the sort function with an explicitly typed sort field
      const manuallySortedItems = sortItemsManually(
        result.items,
        pagination.sort as SortField<TopUserOutputModel>[],
      );

      // Comparison of results
      expect(result.items).toEqual(manuallySortedItems);

      // Pagination meta information verification
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.totalCount).toBe(4);
      expect(result.pagesCount).toBe(2);
    });
  });

  describe('GetAllUserGamesUseCase', () => {
    it('should successfully return two user games (finished and not finished) with default pagination', async () => {
      /**
       * generate questions
       */

      const questions: { body: string; correctAnswers: string[] }[] =
        await questionTestManager.generateQuestions(10);

      /**
       * create and publish questions
       */

      const createdQuestionIds: number[] =
        await questionTestManager.createAndPublishQuestions(
          questions,
          ResultStatus.Success,
        );

      expect(createdQuestionIds).toHaveLength(10);

      /**
       * generate users
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = await usersTestManager.generateUsers(2);

      /**
       * create users
       */

      const userIds: number[] = [];
      for (const user of users) {
        const userId: number | null = await usersTestManager.create(
          user.login,
          user.password,
          user.email,
          ResultStatus.Success,
        );

        expect(userId).not.toBeNull();

        if (userId === null) {
          throw new Error('createResult is null, cannot proceed with the test');
        }

        userIds.push(userId);
      }

      const [firstCreatedId, secondCreatedId] = userIds;

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult).not.toBeNull();

      if (createFirstConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * connect second user to existing pair
       */

      // playerId
      const createSecondConnectionResult: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult).not.toBeNull();

      if (createSecondConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult2: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult2).not.toBeNull();

      if (createFirstConnectionResult2 === null) {
        throw new Error(
          'createFirst2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * connect second user to existing new pair
       */

      // playerId
      const createSecondConnectionResult2: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult2).not.toBeNull();

      if (createSecondConnectionResult2 === null) {
        throw new Error(
          'createSecond2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * get user two games: finished and current
       */

      const query = {
        // sortBy: 'status',
        // sortDirection: 'ASC',
        // pageNumber: 1,
        // pageSize: 1,
      };

      const pagination: Pagination<PaginationQueryParams> = new Pagination(
        query,
        GAME_SORTING_PROPERTIES,
      );

      const userGames: any = await pairsTestManager.getAllMy(
        pagination,
        firstCreatedId,
        ResultStatus.Success,
      );

      expect(userGames).not.toBeNull();
      expect(userGames.items).toHaveLength(2);
      expect(userGames.totalCount).toBe(2);
      expect(userGames.pageSize).toBe(10);
      expect(userGames.pagesCount).toBe(1);
    });

    it('should successfully return two user finished games with sort by status ASC then sort by pairCreatedDate DESC', async () => {
      /**
       * generate questions
       */

      const questions: { body: string; correctAnswers: string[] }[] =
        await questionTestManager.generateQuestions(10);

      /**
       * create and publish questions
       */

      const createdQuestionIds: number[] =
        await questionTestManager.createAndPublishQuestions(
          questions,
          ResultStatus.Success,
        );

      expect(createdQuestionIds).toHaveLength(10);

      /**
       * generate users
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = await usersTestManager.generateUsers(2);

      /**
       * create users
       */

      const userIds: number[] = [];
      for (const user of users) {
        const userId: number | null = await usersTestManager.create(
          user.login,
          user.password,
          user.email,
          ResultStatus.Success,
        );

        expect(userId).not.toBeNull();

        if (userId === null) {
          throw new Error('createResult is null, cannot proceed with the test');
        }

        userIds.push(userId);
      }

      const [firstCreatedId, secondCreatedId] = userIds;

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult).not.toBeNull();

      if (createFirstConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * connect second user to existing pair
       */

      // playerId
      const createSecondConnectionResult: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult).not.toBeNull();

      if (createSecondConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult2: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult2).not.toBeNull();

      if (createFirstConnectionResult2 === null) {
        throw new Error(
          'createFirst2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * connect second user to existing new pair
       */

      // playerId
      const createSecondConnectionResult2: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult2).not.toBeNull();

      if (createSecondConnectionResult2 === null) {
        throw new Error(
          'createSecond2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers2: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * get user two finished games with pagination first by status ASC then by pairCreatedAt DESC
       */

      const query: PaginationQueryParams = {
        sortBy: 'status',
        sortDirection: 'ASC',
        // pageNumber: 1,
        // pageSize: 1,
      };

      const pagination: Pagination<PaginationQueryParams> = new Pagination(
        query,
        GAME_SORTING_PROPERTIES,
      );

      const userGames: PaginationOutput<GameOutputModel> =
        await pairsTestManager.getAllMy(
          pagination,
          firstCreatedId,
          ResultStatus.Success,
        );

      /**
       * sort return:
       * a before b -> return -1
       * b before a -> return 1
       * a the same as b -> return 0
       */

      const sortedGames: GameOutputModel[] = [...userGames.items].sort(
        (a, b): number => {
          // first sort by status asc
          const statusComparison: number = a.status.localeCompare(b.status);

          // if status the same use pairCreatedDate DESC
          if (statusComparison === 0) {
            return (
              new Date(b.pairCreatedDate).getTime() -
              new Date(a.pairCreatedDate).getTime()
            );
          }

          // if status different use comparison of statuses
          return statusComparison;
        },
      );

      expect(userGames.items).toEqual(sortedGames);
      expect(userGames.items).toHaveLength(2);
      expect(userGames.pageSize).toBe(10);
      expect(userGames.pagesCount).toBe(1);
      expect(userGames.totalCount).toBe(2);
    });
  });

  describe('GetMyStatisticUseCase', () => {
    it('should successfully return user statistics', async () => {
      /**
       * generate questions
       */

      const questions: { body: string; correctAnswers: string[] }[] =
        await questionTestManager.generateQuestions(10);

      /**
       * create and publish questions
       */

      const createdQuestionIds: number[] =
        await questionTestManager.createAndPublishQuestions(
          questions,
          ResultStatus.Success,
        );

      expect(createdQuestionIds).toHaveLength(10);

      /**
       * generate users
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = await usersTestManager.generateUsers(2);

      /**
       * create users
       */

      const userIds: number[] = [];
      for (const user of users) {
        const userId: number | null = await usersTestManager.create(
          user.login,
          user.password,
          user.email,
          ResultStatus.Success,
        );

        expect(userId).not.toBeNull();

        if (userId === null) {
          throw new Error('createResult is null, cannot proceed with the test');
        }

        userIds.push(userId);
      }

      const [firstCreatedId, secondCreatedId] = userIds;

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult).not.toBeNull();

      if (createFirstConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * connect second user to existing pair
       */

      // playerId
      const createSecondConnectionResult: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult).not.toBeNull();

      if (createSecondConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult2: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult2).not.toBeNull();

      if (createFirstConnectionResult2 === null) {
        throw new Error(
          'createFirst2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * connect second user to existing new pair
       */

      // playerId
      const createSecondConnectionResult2: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult2).not.toBeNull();

      if (createSecondConnectionResult2 === null) {
        throw new Error(
          'createSecond2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers2: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers2[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult3: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult3).not.toBeNull();

      if (createFirstConnectionResult3 === null) {
        throw new Error(
          'createFirst2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * connect second user to existing new pair
       */

      // playerId
      const createSecondConnectionResult3: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult3).not.toBeNull();

      if (createSecondConnectionResult3 === null) {
        throw new Error(
          'createSecond2ConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers3: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-1-1-1-0 = 4
       * su 1-0-1-0-1 + 1(first answered) = 4
       * draw
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[1].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[3].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers3[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * get use statistic:
       * tree games
       * two lose
       * one draw
       * zero win
       */

      const firstUserStatistic: UserStatisticOutputModel =
        await pairsTestManager.getUserStatistic(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(firstUserStatistic).not.toBeNull();
      expect(firstUserStatistic.sumScore).toBe(8);
      expect(firstUserStatistic.avgScores).toBe(2.67);
      expect(firstUserStatistic.gamesCount).toBe(3);
      expect(firstUserStatistic.winsCount).toBe(0);
      expect(firstUserStatistic.lossesCount).toBe(2);
      expect(firstUserStatistic.drawsCount).toBe(1);
    });
  });

  describe('GetGameUseCase', () => {
    it('should successfully return current user pending game by game id', async () => {
      /**
       * create user dto
       */

      const userDto = {
        login: 'name1',
        password: 'qwerty',
        email: 'email@email.com',
      };

      // userId
      const createResult: number | null = await usersTestManager.create(
        userDto.login,
        userDto.password,
        userDto.email,
        ResultStatus.Success,
      );

      expect(createResult).not.toBeNull();

      if (createResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * spy on the save method in GameTypeormRepository
       */

      const gameTypeormRepository: GameTypeormRepository =
        app.get<GameTypeormRepository>(GameTypeormRepository);

      const saveGameSpy = jest.spyOn(gameTypeormRepository, 'save');

      /**
       * create new pair with user
       */

      const createConnectionResult: number | null =
        await pairsTestManager.createConnection(
          createResult,
          ResultStatus.Success,
        );

      expect(createConnectionResult).not.toBeNull();

      if (createConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * get passed game from save method GameTypeormRepository
       */

      const savedGame: Game = saveGameSpy.mock.calls[0][0];

      const gameId: number = savedGame.id;

      /**
       * get user game by id
       */

      const game: GameOutputModel | null = await pairsTestManager.getGame(
        gameId,
        createResult,
        ResultStatus.Success,
      );

      expect(game).not.toBeNull();

      if (game === null) {
        throw new Error(
          'currentUnfinishedUserGame is null, cannot proceed with the test',
        );
      }

      expect(game.id).toBe(String(gameId));
    });

    it('should not get user game by id: NOT FOUND', async () => {
      /**
       * create user dto
       */

      const userDto = {
        login: 'name1',
        password: 'qwerty',
        email: 'email@email.com',
      };

      // userId
      const createResult: number | null = await usersTestManager.create(
        userDto.login,
        userDto.password,
        userDto.email,
        ResultStatus.Success,
      );

      expect(createResult).not.toBeNull();

      if (createResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * create new pair with user
       */

      const createConnectionResult: number | null =
        await pairsTestManager.createConnection(
          createResult,
          ResultStatus.Success,
        );

      expect(createConnectionResult).not.toBeNull();

      if (createConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * get user game by id
       */

      const invalidGameId: number = 999999;

      const game: GameOutputModel | null = await pairsTestManager.getGame(
        invalidGameId,
        createResult,
        ResultStatus.NotFound,
      );

      expect(game).toBeNull();
    });

    it('should not get user game by id: FORBIDDEN', async () => {
      /**
       * create user dto
       */

      const userDto = {
        login: 'name1',
        password: 'qwerty',
        email: 'email@email.com',
      };

      // userId
      const createResult: number | null = await usersTestManager.create(
        userDto.login,
        userDto.password,
        userDto.email,
        ResultStatus.Success,
      );

      expect(createResult).not.toBeNull();

      if (createResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * spy on the save method in GameTypeormRepository
       */

      const gameTypeormRepository: GameTypeormRepository =
        app.get<GameTypeormRepository>(GameTypeormRepository);

      const saveGameSpy = jest.spyOn(gameTypeormRepository, 'save');

      /**
       * create new pair with user
       */

      const createConnectionResult: number | null =
        await pairsTestManager.createConnection(
          createResult,
          ResultStatus.Success,
        );

      expect(createConnectionResult).not.toBeNull();

      if (createConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * get passed game from save method GameTypeormRepository
       */

      const savedGame: Game = saveGameSpy.mock.calls[0][0];

      const gameId: number = savedGame.id;

      /**
       * get user game by id
       */

      const invalidUserId: number = 9999;

      const game: GameOutputModel | null = await pairsTestManager.getGame(
        gameId,
        invalidUserId,
        ResultStatus.Forbidden,
      );

      expect(game).toBeNull();
    });
  });

  describe('GetCurrentUnfinishedUserGameUseCase', () => {
    it('should successfully return current user game', async () => {
      /**
       * create user dto
       */

      const userDto = {
        login: 'name1',
        password: 'qwerty',
        email: 'email@email.com',
      };

      // userId
      const createResult: number | null = await usersTestManager.create(
        userDto.login,
        userDto.password,
        userDto.email,
        ResultStatus.Success,
      );

      expect(createResult).not.toBeNull();

      if (createResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * create new pair with user
       */

      const createConnectionResult: number | null =
        await pairsTestManager.createConnection(
          createResult,
          ResultStatus.Success,
        );

      expect(createConnectionResult).not.toBeNull();

      if (createConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * get current unfinished user game
       */

      const currentUnfinishedUserGame: GameOutputModel | null =
        await pairsTestManager.getCurrentUnfinishedUserGame(
          createResult,
          ResultStatus.Success,
        );

      expect(currentUnfinishedUserGame).not.toBeNull();
    });

    it('should not get current user game: NOT FOUND', async () => {
      /**
       * get current unfinished user game
       */

      const invalidUserId: number = 999;

      const currentUnfinishedUserGame: GameOutputModel | null =
        await pairsTestManager.getCurrentUnfinishedUserGame(
          invalidUserId,
          ResultStatus.NotFound,
        );

      expect(currentUnfinishedUserGame).toBeNull();
    });
  });

  describe('GetPendingOrJoinedUserGameUseCase', () => {
    it('should successfully return user pending game', async () => {
      /**
       * create user dto
       */

      const userDto = {
        login: 'name1',
        password: 'qwerty',
        email: 'email@email.com',
      };

      // userId
      const createResult: number | null = await usersTestManager.create(
        userDto.login,
        userDto.password,
        userDto.email,
        ResultStatus.Success,
      );

      expect(createResult).not.toBeNull();

      if (createResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * create new pair with user
       */

      // playerId
      const createConnectionResult: number | null =
        await pairsTestManager.createConnection(
          createResult,
          ResultStatus.Success,
        );

      expect(createConnectionResult).not.toBeNull();

      if (createConnectionResult === null) {
        throw new Error(
          'createConnectionResult is null, cannot proceed with the test',
        );
      }

      /**
       * get user game after creation new pair
       */

      const userPendingOrJoinedGame: GameOutputModel | null =
        await pairsTestManager.getPendingOrJoinedUserGame(
          createConnectionResult,
          ResultStatus.Success,
        );

      expect(userPendingOrJoinedGame).not.toBeNull();
    });

    // may delete (additional)
    it('should successfully return user joined game', async () => {
      /**
       * generate users
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = await usersTestManager.generateUsers(2);

      /**
       * create users
       */

      const userIds: number[] = [];
      for (const user of users) {
        const userId: number | null = await usersTestManager.create(
          user.login,
          user.password,
          user.email,
          ResultStatus.Success,
        );

        expect(userId).not.toBeNull();

        if (userId === null) {
          throw new Error('createResult is null, cannot proceed with the test');
        }

        userIds.push(userId);
      }

      const [firstCreatedId, secondCreatedId] = userIds;

      /**
       * create new pair with first user
       */

      const createFirstConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult).not.toBeNull();

      if (createFirstConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * connect second user to existing pair
       */

      const createSecondConnectionResult: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult).not.toBeNull();

      if (createSecondConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * get second user game after join existing pair
       */

      const userPendingOrJoinedGame: GameOutputModel | null =
        await pairsTestManager.getPendingOrJoinedUserGame(
          createSecondConnectionResult,
          ResultStatus.Success,
        );

      expect(userPendingOrJoinedGame).not.toBeNull();
    });

    it('should not return user game: NOT FOUND', async () => {
      /**
       * get second user game after join existing pair
       */

      const invalidPlayerId: number = 9999;

      const userPendingOrJoinedGame: GameOutputModel | null =
        await pairsTestManager.getPendingOrJoinedUserGame(
          invalidPlayerId,
          ResultStatus.NotFound,
        );

      expect(userPendingOrJoinedGame).toBeNull();
    });
  });

  describe('CreateConnectionUseCase', () => {
    it('should successfully create new pair waiting second player', async () => {
      /**
       * create user dto
       */

      const userDto = {
        login: 'name1',
        password: 'qwerty',
        email: 'email@email.com',
      };

      // userId
      const createResult: number | null = await usersTestManager.create(
        userDto.login,
        userDto.password,
        userDto.email,
        ResultStatus.Success,
      );

      expect(createResult).not.toBeNull();

      if (createResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * create new pair with user
       */

      const createConnectionResult: number | null =
        await pairsTestManager.createConnection(
          createResult,
          ResultStatus.Success,
        );

      expect(createConnectionResult).not.toBeNull();

      if (createConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }
    });

    it('should successfully connect current user to existing game', async () => {
      /**
       * generate users
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = await usersTestManager.generateUsers(2);

      /**
       * create users
       */

      const userIds: number[] = [];
      for (const user of users) {
        const userId: number | null = await usersTestManager.create(
          user.login,
          user.password,
          user.email,
          ResultStatus.Success,
        );

        expect(userId).not.toBeNull();

        if (userId === null) {
          throw new Error('createResult is null, cannot proceed with the test');
        }

        userIds.push(userId);
      }

      const [firstCreatedId, secondCreatedId] = userIds;

      /**
       * create new pair with first user
       */

      const createFirstConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult).not.toBeNull();

      if (createFirstConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * connect second user to existing pair
       */

      const createSecondConnectionResult: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult).not.toBeNull();

      if (createSecondConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }
    });

    it('should not connect the same user to existing game: FORBIDDEN', async () => {
      /**
       * create user dto
       */

      const userDto = {
        login: 'name1',
        password: 'qwerty',
        email: 'email@email.com',
      };

      /**
       * create first user
       */

      // userId
      const firstCreatedId: number | null = await usersTestManager.create(
        userDto.login,
        userDto.password,
        userDto.email,
        ResultStatus.Success,
      );

      expect(firstCreatedId).not.toBeNull();

      if (firstCreatedId === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * create new pair with first user
       */

      const createFirstConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult).not.toBeNull();

      if (createFirstConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * connect first user to existing pair
       */

      const createSecondConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Forbidden,
        );

      expect(createSecondConnectionResult).toBeNull();
    });
  });

  describe('CreateAnswerUseCase', () => {
    it('should successfully create two users then 5 answers each user (first user los - score 2; second user win - score 3 (+1 - first answered))', async () => {
      /**
       * generate questions
       */

      const questions: { body: string; correctAnswers: string[] }[] =
        await questionTestManager.generateQuestions(10);

      /**
       * create and publish questions
       */

      const createdQuestionIds: number[] =
        await questionTestManager.createAndPublishQuestions(
          questions,
          ResultStatus.Success,
        );

      expect(createdQuestionIds).toHaveLength(10);

      /**
       * generate users
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = await usersTestManager.generateUsers(2);

      /**
       * create users
       */

      const userIds: number[] = [];
      for (const user of users) {
        const userId: number | null = await usersTestManager.create(
          user.login,
          user.password,
          user.email,
          ResultStatus.Success,
        );

        expect(userId).not.toBeNull();

        if (userId === null) {
          throw new Error('createResult is null, cannot proceed with the test');
        }

        userIds.push(userId);
      }

      const [firstCreatedId, secondCreatedId] = userIds;

      /**
       * spy on the save method in GameTypeormRepository
       */

      const gameTypeormRepository: GameTypeormRepository =
        app.get<GameTypeormRepository>(GameTypeormRepository);

      const saveGameSpy = jest.spyOn(gameTypeormRepository, 'save');

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult).not.toBeNull();

      if (createFirstConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * connect second user to existing pair
       */

      // playerId
      const createSecondConnectionResult: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult).not.toBeNull();

      if (createSecondConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       * get passed game from save method GameTypeormRepository
       */

      const savedGame: Game = saveGameSpy.mock.calls[0][0];

      const gameId: number = savedGame.id;

      /**
      //  * Get the game to check results
      //  */

      const finishedGame: GameOutputModel | null =
        await pairsTestManager.getGame(
          Number(gameId),
          secondCreatedId,
          ResultStatus.Success,
        );
      expect(finishedGame).not.toBeNull();

      if (finishedGame === null) {
        throw new Error('finishedGame is null, cannot proceed with the test');
      }

      expect(finishedGame.finishGameDate).not.toBeNull();
      expect(finishedGame.status).toBe(GameStatus.Finished);
      expect(finishedGame.firstPlayerProgress.score).toBe(2);
      expect(finishedGame.secondPlayerProgress?.score).not.toBeNull();

      if (finishedGame.secondPlayerProgress === null) {
        throw new Error(
          'finishedGame.secondPlayerProgress is null, cannot proceed with the test',
        );
      }

      expect(finishedGame.secondPlayerProgress.score).toBe(4);
    });

    it('should not create answer - current user is not inside active pair: FORBIDDEN', async () => {
      /**
       * create user dto
       */

      const userDto = {
        login: 'name1',
        password: 'qwerty',
        email: 'email@email.com',
      };

      // userId
      const createResult: number | null = await usersTestManager.create(
        userDto.login,
        userDto.password,
        userDto.email,
        ResultStatus.Success,
      );

      expect(createResult).not.toBeNull();

      if (createResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * create first user answer
       */

      const testAnswer: string = 'test';

      // fua
      const fua: number | null = await pairsTestManager.createAnswer(
        createResult,
        testAnswer,
        ResultStatus.Forbidden,
      );

      expect(fua).toBeNull();
    });

    it('should not create answer - user is in active pair but has already answered to all questions: FORBIDDEN', async () => {
      /**
       * generate questions
       */

      const questions: { body: string; correctAnswers: string[] }[] =
        await questionTestManager.generateQuestions(10);

      /**
       * create and publish questions
       */

      const createdQuestionIds: number[] =
        await questionTestManager.createAndPublishQuestions(
          questions,
          ResultStatus.Success,
        );

      expect(createdQuestionIds).toHaveLength(10);

      /**
       * generate users
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = await usersTestManager.generateUsers(2);

      /**
       * create users
       */

      const userIds: number[] = [];
      for (const user of users) {
        const userId: number | null = await usersTestManager.create(
          user.login,
          user.password,
          user.email,
          ResultStatus.Success,
        );

        expect(userId).not.toBeNull();

        if (userId === null) {
          throw new Error('createResult is null, cannot proceed with the test');
        }

        userIds.push(userId);
      }

      const [firstCreatedId, secondCreatedId] = userIds;

      /**
       * create new pair with first user
       */

      // playerId
      const createFirstConnectionResult: number | null =
        await pairsTestManager.createConnection(
          firstCreatedId,
          ResultStatus.Success,
        );

      expect(createFirstConnectionResult).not.toBeNull();

      if (createFirstConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * connect second user to existing pair
       */

      // playerId
      const createSecondConnectionResult: number | null =
        await pairsTestManager.createConnection(
          secondCreatedId,
          ResultStatus.Success,
        );

      expect(createSecondConnectionResult).not.toBeNull();

      if (createSecondConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * validate current user game and get game question ids from that game in order with correct answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers: {
        id: string;
        answers: string[];
      }[] =
        await pairsTestManager.validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
          questions,
          firstCreatedId,
          createdQuestionIds,
        );

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       * second win
       */

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        'wrongAnswer',
      );

      await pairsTestManager.answerAndCheckSuccess(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[4].answers[0],
      );

      await pairsTestManager.answerAndCheckSuccess(
        firstCreatedId,
        'wrongAnswer',
      );

      /**
       //  * create one more additional answer - user is not in active pair
       //  */

      const fuaFailed: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        'test',
        ResultStatus.Forbidden,
      );

      expect(fuaFailed).toBeNull();
    });
  });
});
