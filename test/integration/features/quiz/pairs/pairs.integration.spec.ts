import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PairsTestManager } from './pairs-test-manager';
import { initSettings } from '../../../utils/init-settings';
import { deleteAllData } from '../../../../utils/delete-all-data';
import { UsersTestManager } from './users-test-manager';
import { ResultStatus } from '../../../../../src/base/types/object-result';
import { Game } from '../../../../../src/features/quiz/domain/game.entity';
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

      const currentUnfinishedUserGame: GameOutputModel | null =
        await pairsTestManager.getGame(
          gameId,
          createResult,
          ResultStatus.Success,
        );

      expect(currentUnfinishedUserGame).not.toBeNull();

      if (currentUnfinishedUserGame === null) {
        throw new Error(
          'currentUnfinishedUserGame is null, cannot proceed with the test',
        );
      }

      expect(currentUnfinishedUserGame.id).toBe(String(gameId));
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

      const userId: number = 999;

      const currentUnfinishedUserGame: GameOutputModel | null =
        await pairsTestManager.getCurrentUnfinishedUserGame(
          userId,
          ResultStatus.NotFound,
        );

      expect(currentUnfinishedUserGame).toBeNull();
    });
  });

  describe.skip('CreateConnectionUseCase', () => {
    it('should successfully create new pair waiting second player', async () => {
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

      // const loginModel = {
      //   userId: createResult,
      //   ip: '192.168.1.3',
      //   deviceName:
      //     'Mozilla/5.0 (Windows NT 6.0; rv:40.0) Gecko/20100101 Firefox/40.0',
      //   refreshToken: '',
      // };
      //
      // const loginResult: null | { accessToken: string; refreshToken: string } =
      //   await usersTestManager.login(
      //     loginModel.userId,
      //     loginModel.ip,
      //     loginModel.deviceName,
      //     loginModel.refreshToken,
      //     ResultStatus.Success,
      //   );
      //
      // expect(loginResult).not.toBeNull();
      // console.log(loginResult);

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

  describe.skip('GetUserPendingOrJoinedGameUseCase', () => {
    it('should successfully return user pending game', async () => {
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

      // playerId
      const createConnectionResult: number | null =
        await pairsTestManager.createConnection(
          createResult,
          ResultStatus.Success,
        );

      expect(createConnectionResult).not.toBeNull();

      if (createConnectionResult === null) {
        throw new Error('createResult is null, cannot proceed with the test');
      }

      // const userPendingOrJoinedGameUseCase: Game =
      //   pairsTestManager.getPendingOrJoinedUserGame(
      //     createConnectionResult,
      //     ResultStatus,
      //   );
    });

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
    it('should successfully create one answer each user', async () => {
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

      const game: GameOutputModel | null =
        await pairsTestManager.getCurrentUnfinishedUserGame(
          firstCreatedId,
          ResultStatus.Success,
        );
      expect(game).not.toBeNull();

      if (game === null) {
        throw new Error('game is null, cannot proceed with the test');
      }

      /**
       * Verify 5 random questions are added to the game
       */

      const gameQuestions: QuestionModel[] | null = game.questions;
      console.log('gameQuestions', gameQuestions);

      expect(gameQuestions).toHaveLength(5);

      if (gameQuestions === null) {
        throw new Error('gameQuestions is null, cannot proceed with the test');
      }

      const questionIdsInGame: string[] = gameQuestions.map((q) => q.id);

      // Ensure all questions in the game are among the created ones
      questionIdsInGame.forEach((id) => {
        expect(createdQuestionIds).toContain(id);
      });

      console.log('questionIdsInGame', questionIdsInGame);

      /**
       * first user answer the first user
       */

      // answerId
      // const createFirstUserFirstAnswerResult: number | null =
      //   await pairsTestManager.createAnswer(firstCreatedId);
    });
  });
});
