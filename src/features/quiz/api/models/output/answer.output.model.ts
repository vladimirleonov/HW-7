import { AnswerStatus } from '../../../domain/answer.entity';

export class AnswerOutputModel {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
}
