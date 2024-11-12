import { Module } from '@nestjs/common';
import { QuizSaController } from './api/quiz-sa.controller.ts.controller';
import { CreateQuestionUseCase } from './application/use-cases/create-question.usecase';

const providers = [
  // use cases
  CreateQuestionUseCase,
];

@Module({
  controllers: [QuizSaController],
  providers: [...providers],
})
export class QuizModule {}
