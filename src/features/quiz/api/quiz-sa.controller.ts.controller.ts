import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../core/guards/passport/basic-auth.guard';
import { QuestionCreateModel } from './models/input/create-question.input.model';

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz')
export class QuizSaController {
  @Post()
  async create(@Body() questionCreateModel: QuestionCreateModel) {
    const { body, correctAnswers } = questionCreateModel;

    return 'create quiz';
  }
}
