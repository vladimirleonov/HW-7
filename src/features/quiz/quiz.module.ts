import { Module } from '@nestjs/common';
import { QuizSaController } from './api/quiz-sa.controller';
import { CreateQuestionUseCase } from './application/commands/create-question.command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionsTypeormRepository } from './infrastructure/questions-typeorm.repository';
import { GetQuestionUseCase } from './application/queries/get-question.query';
import { QuestionTypeormQueryRepository } from './infrastructure/question-typeorm.query-repository';
import { DeleteQuestionUseCase } from './application/commands/delete-question.command';
import { UpdateQuestionUseCase } from './application/commands/update-question.command';
import { UpdatePublishedStatusUseCase } from './application/commands/update-published-status.command';
import { GetAllQuestionsUseCase } from './application/queries/get-all-questions.query';
import { QuizController } from './api/quiz.controller';
import { CreateConnectionUseCase } from './application/commands/create-connection.command';
import { PlayerTypeormRepository } from './infrastructure/player-typeorm.repository';
import { GameTypeormRepository } from './infrastructure/game-typeorm.repository';
import { Player } from './domain/player.entity';
import { GameQuestion } from './domain/game-questions.entity';
import { Answer } from './domain/answer.entity';
import { Game } from './domain/game.entity';
import { GameQuestionTypeormRepository } from './infrastructure/game-question-typeorm.tepository';
import { GetUserPendingOrJoinedGameUseCase } from './application/queries/get-user-pending-or-joined-game.query';
import { GameTypeormQueryRepository } from './infrastructure/game-typeorm.query-repository';
import { PlayerTypeormQueryRepository } from './infrastructure/player-typeorm.query-repository';

const providers = [
  // command usecases
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  UpdatePublishedStatusUseCase,

  CreateConnectionUseCase,

  // query usecases
  GetAllQuestionsUseCase,
  GetQuestionUseCase,
  DeleteQuestionUseCase,

  GetUserPendingOrJoinedGameUseCase,

  // repos
  QuestionsTypeormRepository,
  QuestionTypeormQueryRepository,
  PlayerTypeormRepository,
  PlayerTypeormQueryRepository,
  GameTypeormRepository,
  GameTypeormQueryRepository,
  GameQuestionTypeormRepository,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Player, Game, GameQuestion, Answer, Question]),
  ],
  controllers: [QuizController, QuizSaController],
  providers: [...providers],
})
export class QuizModule {}
