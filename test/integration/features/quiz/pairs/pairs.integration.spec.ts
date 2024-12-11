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
import {
  GameOutputModel,
  QuestionModel,
} from '../../../../../src/features/quiz/api/models/output/game.output.model';

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

  describe.skip('GetGameUseCase', () => {
    it('should successfully return current user game by game id', async () => {
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

  describe.skip('GetCurrentUnfinishedUserGameUseCase', () => {
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

  describe.skip('GetPendingOrJoinedUserGameUseCase', () => {
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
       * create two user dto
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = [];

      for (let i = 0; i < 2; i++) {
        const user = {
          login: `name${i}`,
          password: `qwerty${i}`,
          email: `email${i}@email.com`,
        };

        users.push(user);
      }

      /**
       * create first user
       */

      // userId
      const firstCreatedId: number | null = await usersTestManager.create(
        users[0].login,
        users[0].password,
        users[0].email,
        ResultStatus.Success,
      );

      expect(firstCreatedId).not.toBeNull();

      if (firstCreatedId === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * create second user
       */

      // userId
      const secondCreatedId: number | null = await usersTestManager.create(
        users[1].login,
        users[1].password,
        users[1].email,
        ResultStatus.Success,
      );

      expect(secondCreatedId).not.toBeNull();

      if (secondCreatedId === null) {
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

  describe.skip('CreateConnectionUseCase', () => {
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
       * create two user dto
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = [];

      for (let i = 0; i < 2; i++) {
        const user = {
          login: `name${i}`,
          password: `qwerty${i}`,
          email: `email${i}@email.com`,
        };

        users.push(user);
      }

      /**
       * create first user
       */

      // userId
      const firstCreatedId: number | null = await usersTestManager.create(
        users[0].login,
        users[0].password,
        users[0].email,
        ResultStatus.Success,
      );

      expect(firstCreatedId).not.toBeNull();

      if (firstCreatedId === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * create second user
       */

      // userId
      const secondCreatedId: number | null = await usersTestManager.create(
        users[1].login,
        users[1].password,
        users[1].email,
        ResultStatus.Success,
      );

      expect(secondCreatedId).not.toBeNull();

      if (secondCreatedId === null) {
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

  describe.skip('CreateAnswerUseCase', () => {
    it('should successfully create two users then 5 answers each user (first user los - score 2; second user win - score 3 (+1 - first answered))', async () => {
      /**
       * create and publish questions
       */

      const questions = [
        { body: 'question1', correctAnswers: ['1', '1.1'] },
        { body: 'question2', correctAnswers: ['2', '2.2'] },
        { body: 'question3', correctAnswers: ['3', '3.3'] },
        { body: 'question4', correctAnswers: ['4', '4.4'] },
        { body: 'question5', correctAnswers: ['5', '5.5'] },
        { body: 'question6', correctAnswers: ['6', '6.6'] },
        { body: 'question7', correctAnswers: ['7', '7.7'] },
        { body: 'question8', correctAnswers: ['8', '8.8'] },
        { body: 'question9', correctAnswers: ['9', '9.9'] },
        { body: 'question10', correctAnswers: ['10', '10.10'] },
      ];

      const createdQuestionIds: number[] =
        await questionTestManager.createAndPublishQuestions(
          questions,
          ResultStatus.Success,
        );

      expect(createdQuestionIds).toHaveLength(10);

      /**
       * create two user dto
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = [];

      for (let i = 0; i < 2; i++) {
        const user = {
          login: `name${i}`,
          password: `qwerty${i}`,
          email: `email${i}@email.com`,
        };

        users.push(user);
      }

      /**
       * create first user
       */

      // userId
      const firstCreatedId: number | null = await usersTestManager.create(
        users[0].login,
        users[0].password,
        users[0].email,
        ResultStatus.Success,
      );

      expect(firstCreatedId).not.toBeNull();

      if (firstCreatedId === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * create second user
       */

      // userId
      const secondCreatedId: number | null = await usersTestManager.create(
        users[1].login,
        users[1].password,
        users[1].email,
        ResultStatus.Success,
      );

      expect(secondCreatedId).not.toBeNull();

      if (secondCreatedId === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

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
       * Get the current game
       */

      const currentUserGame: GameOutputModel | null =
        await pairsTestManager.getCurrentUnfinishedUserGame(
          firstCreatedId,
          ResultStatus.Success,
        );
      expect(currentUserGame).not.toBeNull();

      if (currentUserGame === null) {
        throw new Error('game is null, cannot proceed with the test');
      }

      expect(currentUserGame.status).toBe(GameStatus.Active);
      expect(currentUserGame.pairCreatedDate).not.toBeNull();
      expect(currentUserGame.startGameDate).not.toBeNull();
      expect(currentUserGame.finishGameDate).toBeNull();

      /**
       * Verify 5 random questions are added to the game
       */

      const gameQuestions: QuestionModel[] | null = currentUserGame.questions;

      expect(gameQuestions).toHaveLength(5);

      if (gameQuestions === null) {
        throw new Error('gameQuestions is null, cannot proceed with the test');
      }

      const questionIdsInGame: string[] = gameQuestions.map((q) => q.id);

      // Ensure all questions in the game are among the created ones
      questionIdsInGame.forEach((id) => {
        expect(createdQuestionIds).toContain(Number(id));
      });

      /**
       * get game question ids in order with answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers: {
        id: string;
        answers: string[];
      }[] = [];

      gameQuestions.forEach((gq) => {
        for (let i = 0; i < questions.length; i++) {
          if (gq.body === questions[i].body) {
            gameQuestionIdsInOrderWithCorrectAnswers.push({
              id: gq.id,
              answers: questions[i].correctAnswers,
            });
            break;
          }
        }
      });

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       */

      // fua1 +
      const fua1: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
        ResultStatus.Success,
      );

      // fua2 -
      const fua2: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        'test',
        ResultStatus.Success,
      );

      // fua3 +
      const fua3: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
        ResultStatus.Success,
      );

      // fu4 -
      const fua4: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        'test',
        ResultStatus.Success,
      );

      // sua1 +
      const sua1: number | null = await pairsTestManager.createAnswer(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
        ResultStatus.Success,
      );

      // sua2 -
      const sua2: number | null = await pairsTestManager.createAnswer(
        secondCreatedId,
        'test',
        ResultStatus.Success,
      );

      // sua3 +
      const sua3: number | null = await pairsTestManager.createAnswer(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
        ResultStatus.Success,
      );

      // sua4 -
      const sua4: number | null = await pairsTestManager.createAnswer(
        secondCreatedId,
        'test',
        ResultStatus.Success,
      );

      // sua5 +
      const sua5: number | null = await pairsTestManager.createAnswer(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[4].answers[0],
        ResultStatus.Success,
      );

      // fua5 -
      const fua5: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        'test',
        ResultStatus.Success,
      );

      expect(fua1).not.toBeNull();
      expect(fua2).not.toBeNull();
      expect(fua3).not.toBeNull();
      expect(fua4).not.toBeNull();
      expect(fua5).not.toBeNull();

      expect(sua1).not.toBeNull();
      expect(sua2).not.toBeNull();
      expect(sua3).not.toBeNull();
      expect(sua4).not.toBeNull();
      expect(sua5).not.toBeNull();

      /**
      //  * Get the game to check results
      //  */

      const finishedGame: GameOutputModel | null =
        await pairsTestManager.getGame(
          Number(currentUserGame.id),
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
       * create and publish questions
       */

      const questions = [
        { body: 'question1', correctAnswers: ['1', '1.1'] },
        { body: 'question2', correctAnswers: ['2', '2.2'] },
        { body: 'question3', correctAnswers: ['3', '3.3'] },
        { body: 'question4', correctAnswers: ['4', '4.4'] },
        { body: 'question5', correctAnswers: ['5', '5.5'] },
        { body: 'question6', correctAnswers: ['6', '6.6'] },
        { body: 'question7', correctAnswers: ['7', '7.7'] },
        { body: 'question8', correctAnswers: ['8', '8.8'] },
        { body: 'question9', correctAnswers: ['9', '9.9'] },
        { body: 'question10', correctAnswers: ['10', '10.10'] },
      ];

      const createdQuestionIds: number[] =
        await questionTestManager.createAndPublishQuestions(
          questions,
          ResultStatus.Success,
        );

      expect(createdQuestionIds).toHaveLength(10);

      /**
       * create two user dto
       */

      const users: {
        login: string;
        email: string;
        password: string;
      }[] = [];

      for (let i = 0; i < 2; i++) {
        const user = {
          login: `name${i}`,
          password: `qwerty${i}`,
          email: `email${i}@email.com`,
        };

        users.push(user);
      }

      /**
       * create first user
       */

      // userId
      const firstCreatedId: number | null = await usersTestManager.create(
        users[0].login,
        users[0].password,
        users[0].email,
        ResultStatus.Success,
      );

      expect(firstCreatedId).not.toBeNull();

      if (firstCreatedId === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      /**
       * create second user
       */

      // userId
      const secondCreatedId: number | null = await usersTestManager.create(
        users[1].login,
        users[1].password,
        users[1].email,
        ResultStatus.Success,
      );

      expect(secondCreatedId).not.toBeNull();

      if (secondCreatedId === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

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
       * Get the current game
       */

      const currentUserGame: GameOutputModel | null =
        await pairsTestManager.getCurrentUnfinishedUserGame(
          firstCreatedId,
          ResultStatus.Success,
        );
      expect(currentUserGame).not.toBeNull();

      if (currentUserGame === null) {
        throw new Error('game is null, cannot proceed with the test');
      }

      expect(currentUserGame.status).toBe(GameStatus.Active);
      expect(currentUserGame.pairCreatedDate).not.toBeNull();
      expect(currentUserGame.startGameDate).not.toBeNull();
      expect(currentUserGame.finishGameDate).toBeNull();

      /**
       * Verify 5 random questions are added to the game
       */

      const gameQuestions: QuestionModel[] | null = currentUserGame.questions;

      expect(gameQuestions).toHaveLength(5);

      if (gameQuestions === null) {
        throw new Error('gameQuestions is null, cannot proceed with the test');
      }

      const questionIdsInGame: string[] = gameQuestions.map((q) => q.id);

      // Ensure all questions in the game are among the created ones
      questionIdsInGame.forEach((id) => {
        expect(createdQuestionIds).toContain(Number(id));
      });

      /**
       * get game question ids in order with answers
       */

      const gameQuestionIdsInOrderWithCorrectAnswers: {
        id: string;
        answers: string[];
      }[] = [];

      gameQuestions.forEach((gq) => {
        for (let i = 0; i < questions.length; i++) {
          if (gq.body === questions[i].body) {
            gameQuestionIdsInOrderWithCorrectAnswers.push({
              id: gq.id,
              answers: questions[i].correctAnswers,
            });
            break;
          }
        }
      });

      /**
       * fu 1-0-1-0-0 = 2
       * su 1-0-1-0-1 + 1(first answered) = 4
       */

      // fua1 +
      const fua1: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
        ResultStatus.Success,
      );

      // fua2 -
      const fua2: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        'test',
        ResultStatus.Success,
      );

      // fua3 +
      const fua3: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
        ResultStatus.Success,
      );

      // fu4 -
      const fua4: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        'test',
        ResultStatus.Success,
      );

      // sua1 +
      const sua1: number | null = await pairsTestManager.createAnswer(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[0].answers[0],
        ResultStatus.Success,
      );

      // sua2 -
      const sua2: number | null = await pairsTestManager.createAnswer(
        secondCreatedId,
        'test',
        ResultStatus.Success,
      );

      // sua3 +
      const sua3: number | null = await pairsTestManager.createAnswer(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[2].answers[0],
        ResultStatus.Success,
      );

      // sua4 -
      const sua4: number | null = await pairsTestManager.createAnswer(
        secondCreatedId,
        'test',
        ResultStatus.Success,
      );

      // sua5 +
      const sua5: number | null = await pairsTestManager.createAnswer(
        secondCreatedId,
        gameQuestionIdsInOrderWithCorrectAnswers[4].answers[0],
        ResultStatus.Success,
      );

      // fua5 -
      const fua5: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        'test',
        ResultStatus.Success,
      );

      expect(fua1).not.toBeNull();
      expect(fua2).not.toBeNull();
      expect(fua3).not.toBeNull();
      expect(fua4).not.toBeNull();
      expect(fua5).not.toBeNull();

      expect(sua1).not.toBeNull();
      expect(sua2).not.toBeNull();
      expect(sua3).not.toBeNull();
      expect(sua4).not.toBeNull();
      expect(sua5).not.toBeNull();

      /**
       //  * create one more additional answer - user is not in active pair
       //  */

      const fua6: number | null = await pairsTestManager.createAnswer(
        firstCreatedId,
        'test',
        ResultStatus.Forbidden,
      );

      expect(fua6).toBeNull();
    });
  });
});
