import { Module } from '@nestjs/common';
import { PairsSaController } from './api/pairs-sa.controller';
import { CreateQuestionUseCase } from './application/commands/create-question.command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionsTypeormRepository } from './infrastructure/question/questions-typeorm.repository';
import { GetQuestionUseCase } from './application/queries/get-question.query';
import { QuestionTypeormQueryRepository } from './infrastructure/question/question-typeorm.query-repository';
import { DeleteQuestionUseCase } from './application/commands/delete-question.command';
import { UpdateQuestionUseCase } from './application/commands/update-question.command';
import { UpdatePublishedStatusUseCase } from './application/commands/update-published-status.command';
import { GetAllQuestionsUseCase } from './application/queries/get-all-questions.query';
import { PairsController } from './api/pairs.controller';
import { CreateConnectionUseCase } from './application/commands/create-connection.command';
import { PlayerTypeormRepository } from './infrastructure/player/player-typeorm.repository';
import { GameTypeormRepository } from './infrastructure/game/game-typeorm.repository';
import { Player } from './domain/player.entity';
import { GameQuestion } from './domain/game-questions.entity';
import { Answer } from './domain/answer.entity';
import { Game } from './domain/game.entity';
import { GameQuestionTypeormRepository } from './infrastructure/game-question/game-question-typeorm.repository';
import { GetPendingOrJoinedUserGameUseCase } from './application/queries/get-pending-or-joined-user-game.query';
import { GameTypeormQueryRepository } from './infrastructure/game/game-typeorm.query-repository';
import { PlayerTypeormQueryRepository } from './infrastructure/player/player-typeorm.query-repository';
import { GetCurrentUnfinishedUserGameUseCase } from './application/queries/get-current-unfinished-user-game.query';
import { GetGameUseCase } from './application/queries/get-game.query';
import { CreateAnswerUseCase } from './application/commands/create-answer.command';
import { AnswerTypeormRepository } from './infrastructure/answer/answer-typeorm.repository';
import { AnswerTypeormQueryRepository } from './infrastructure/answer/answer-typeorm.query-repository';
import { GetAnswerUseCase } from './application/queries/get-answer.query';
import { GetAllUserGamesUseCase } from './application/queries/get-all-user-games.query';
import { GetMyStatisticUseCase } from './application/queries/get-my-statistic.query';
import { GetTopUsersUseCase } from './application/queries/get-top-users.query';
import { UsersController } from './api/users.controller';

const CommandUseCases = [
  CreateQuestionUseCase,
  CreateConnectionUseCase,
  CreateAnswerUseCase,
  UpdateQuestionUseCase,
  UpdatePublishedStatusUseCase,
];

const QueryUseCases = [
  GetAllQuestionsUseCase,
  GetQuestionUseCase,
  GetPendingOrJoinedUserGameUseCase,
  GetCurrentUnfinishedUserGameUseCase,
  GetGameUseCase,
  DeleteQuestionUseCase,
  GetAnswerUseCase,
  GetAllUserGamesUseCase,
  GetMyStatisticUseCase,
  GetTopUsersUseCase,
];

const Repositories = [
  QuestionsTypeormRepository,
  QuestionTypeormQueryRepository,
  PlayerTypeormRepository,
  PlayerTypeormQueryRepository,
  GameTypeormRepository,
  GameTypeormQueryRepository,
  GameQuestionTypeormRepository,
  AnswerTypeormRepository,
  AnswerTypeormQueryRepository,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Player, Game, GameQuestion, Answer, Question]),
  ],
  controllers: [PairsController, UsersController, PairsSaController],
  providers: [...CommandUseCases, ...QueryUseCases, ...Repositories],
})
export class QuizModule {}
