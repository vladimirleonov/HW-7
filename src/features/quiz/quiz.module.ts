import { Module } from '@nestjs/common';
import { QuizSaController } from './api/quiz-sa.controller.ts.controller';
import { CreateQuestionUseCase } from './application/use-cases/create-question.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionsTypeormRepository } from './infrastructure/questions-typeorm.repository';

const providers = [
  // use cases
  CreateQuestionUseCase,

  // repos
  QuestionsTypeormRepository,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Question])],
  exports: [CreateQuestionUseCase],
  controllers: [QuizSaController],
  providers: [...providers],
})
export class QuizModule {}
