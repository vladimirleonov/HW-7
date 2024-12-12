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
import { GameOutputModel } from '../../../../../src/features/quiz/api/models/output/game.output.model';
import {
  Pagination,
  PaginationOutput,
} from '../../../../../src/base/models/pagination.base.model';
import { PaginationQuery } from '../../../../../src/base/models/pagination-query.input.model';
import {
  GetAllUserGamesQuery,
  GetAllUserGamesUseCase,
} from '../../../../../src/features/quiz/application/queries/get-all-user-games.query';

export class PairsTestManager {
  constructor(protected readonly app: INestApplication) {}

  async getAllMy(
    pagination: Pagination<PaginationQuery>,
    userId: number,
    expectedStatus: ResultStatus,
  ): Promise<PaginationOutput<GameOutputModel>> {
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
}
