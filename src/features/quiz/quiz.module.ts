import { Module } from '@nestjs/common';
import { QuizSaController } from './api/quiz-sa.controller.ts.controller';
import { CreateQuestionUseCase } from './application/commands/create-question.command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionsTypeormRepository } from './infrastructure/questions-typeorm.repository';
import { GetQuestionUseCase } from './application/queries/get-question.query';
import { QuestionTypeormQueryRepository } from './infrastructure/question-typeorm.query-repository';
import { DeleteQuestionUseCase } from './application/commands/delete-question.command';

const providers = [
  // commands usecases
  CreateQuestionUseCase,

  // query usecases
  GetQuestionUseCase,
  DeleteQuestionUseCase,

  // repos
  QuestionsTypeormRepository,
  QuestionTypeormQueryRepository,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Question])],
  controllers: [QuizSaController],
  providers: [...providers],
})
export class QuizModule {}
