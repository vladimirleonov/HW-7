import { INestApplication } from '@nestjs/common';
import {
  CreateConnectionCommand,
  CreateConnectionUseCase,
} from '../../../../../src/features/quiz/application/commands/create-connection.command';
import {
  Result,
  ResultStatus,
} from '../../../../../src/base/types/object-result';
import {
  GetCurrentUnfinishedUserGameQuery,
  GetCurrentUnfinishedUserGameUseCase,
} from '../../../../../src/features/quiz/application/queries/get-current-unfinished-user-game.query';
import {
  GetGameQuery,
  GetGameUseCase,
} from '../../../../../src/features/quiz/application/queries/get-game.query';
import {
  CreateAnswerCommand,
  CreateAnswerUseCase,
} from '../../../../../src/features/quiz/application/commands/create-answer.command';
import {
  GetPendingOrJoinedUserGameQuery,
  GetPendingOrJoinedUserGameUseCase,
} from '../../../../../src/features/quiz/application/queries/get-pending-or-joined-user-game.query';
import {
  GameOutputModel,
  QuestionModel,
} from '../../../../../src/features/quiz/api/models/output/game.output.model';
import {
  GamePagination,
  PaginationOutput,
} from '../../../../../src/base/models/pagination.base.model';
import {
  GetAllUserGamesQuery,
  GetAllUserGamesUseCase,
} from '../../../../../src/features/quiz/application/queries/get-all-user-games.query';
import { GamePaginationQuery } from '../../../../../src/features/quiz/api/models/input/game-pagination-query.input.model';
import {
  GetMyStatisticQuery,
  GetMyStatisticUseCase,
} from '../../../../../src/features/quiz/application/queries/get-my-statistic.query';
import { UserStatisticOutputModel } from '../../../../../src/features/quiz/api/models/output/my-statistic.output.model';
import { GameStatus } from '../../../../../src/features/quiz/domain/game.entity';

export class PairsTestManager {
  constructor(protected readonly app: INestApplication) {}

  async getAllMy(
    pagination: GamePagination<GamePaginationQuery>,
    userId: number,
    expectedStatus: ResultStatus,
  ): Promise<any> {
    const query: GetAllUserGamesQuery = new GetAllUserGamesQuery(
      pagination,
      userId,
    );

    const getAllUserGamesUseCase: GetAllUserGamesUseCase =
      this.app.get<GetAllUserGamesUseCase>(GetAllUserGamesUseCase);

    const result: Result<PaginationOutput<GameOutputModel>> =
      await getAllUserGamesUseCase.execute(query);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to get all user games. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async getUserStatistic(
    userId: number,
    expectedStatus: ResultStatus,
  ): Promise<UserStatisticOutputModel> {
    const query: GetMyStatisticQuery = new GetMyStatisticQuery(userId);

    const getMyStatisticUseCase: GetMyStatisticUseCase =
      this.app.get<GetMyStatisticUseCase>(GetMyStatisticUseCase);

    const result: Result<UserStatisticOutputModel> =
      await getMyStatisticUseCase.execute(query);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to get user statistic. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async getGame(
    gameId: number,
    userId: number,
    expectedStatus: ResultStatus,
  ): Promise<GameOutputModel | null> {
    const query: GetGameQuery = new GetGameQuery(gameId, userId);

    const getGameUseCase: GetGameUseCase =
      this.app.get<GetGameUseCase>(GetGameUseCase);

    const result: Result<GameOutputModel | null> =
      await getGameUseCase.execute(query);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async getCurrentUnfinishedUserGame(
    userId: number,
    expectedStatus: ResultStatus,
  ): Promise<GameOutputModel | null> {
    const query: GetCurrentUnfinishedUserGameQuery =
      new GetCurrentUnfinishedUserGameQuery(userId);

    const getCurrentUnfinishedUserGameUseCase =
      this.app.get<GetCurrentUnfinishedUserGameUseCase>(
        GetCurrentUnfinishedUserGameUseCase,
      );

    const result: Result<GameOutputModel | null> =
      await getCurrentUnfinishedUserGameUseCase.execute(query);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async getPendingOrJoinedUserGame(
    playerId: number,
    expectedStatus: ResultStatus,
  ): Promise<GameOutputModel | null> {
    const query: GetPendingOrJoinedUserGameQuery =
      new GetPendingOrJoinedUserGameQuery(playerId);

    const getPendingOrJoinedUserGameUseCase: GetPendingOrJoinedUserGameUseCase =
      this.app.get<GetPendingOrJoinedUserGameUseCase>(
        GetPendingOrJoinedUserGameUseCase,
      );

    const result: Result<GameOutputModel | null> =
      await getPendingOrJoinedUserGameUseCase.execute(query);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async validateCurrentUserGameAndGetGameQuestionIdsInOrderWithCorrectAnswers(
    questions: { body: string; correctAnswers: string[] }[],
    userId: number,
    createdQuestionIds: number[],
  ): Promise<
    {
      id: string;
      answers: string[];
    }[]
  > {
    /**
     * Get the current game
     */

    const currentUserGame: GameOutputModel | null =
      await this.getCurrentUnfinishedUserGame(userId, ResultStatus.Success);
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

    const currentGameQuestions: QuestionModel[] | null =
      currentUserGame.questions;

    expect(currentGameQuestions).toHaveLength(5);

    if (currentGameQuestions === null) {
      throw new Error('gameQuestions is null, cannot proceed with the test');
    }

    const questionIdsInGame: string[] = currentGameQuestions.map((q) => q.id);
    console.log('createdQuestionIds', createdQuestionIds);
    console.log('questionIdsInGame', questionIdsInGame);

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

    currentGameQuestions.forEach((gq) => {
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

    return gameQuestionIdsInOrderWithCorrectAnswers;
  }

  async createConnection(
    userId: number,
    expectedStatus: ResultStatus,
  ): Promise<number | null> {
    const command: CreateConnectionCommand = new CreateConnectionCommand(
      userId,
    );

    const createConnectionUseCase: CreateConnectionUseCase =
      this.app.get<CreateConnectionUseCase>(CreateConnectionUseCase);

    const result: Result<number | null> =
      await createConnectionUseCase.execute(command);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create question. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async createAnswer(
    userId: number,
    answer: string,
    expectedStatus: ResultStatus,
  ): Promise<number | null> {
    const command: CreateAnswerCommand = new CreateAnswerCommand(
      userId,
      answer,
    );

    // answerId
    const createAnswerUseCase: CreateAnswerUseCase =
      this.app.get<CreateAnswerUseCase>(CreateAnswerUseCase);

    const result: Result<number | null> =
      await createAnswerUseCase.execute(command);

    if (result.status !== expectedStatus) {
      throw new Error(
        `Failed to create answer. Expected status: ${expectedStatus}, but got: ${result.status}`,
      );
    }

    return result.data;
  }

  async answerAndCheckSuccess(userId: number, answer: string) {
    const answerResult: number | null = await this.createAnswer(
      userId,
      answer,
      ResultStatus.Success,
    );

    expect(answerResult).not.toBeNull();
  }
}
