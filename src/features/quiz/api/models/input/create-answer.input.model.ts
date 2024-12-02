import { IsString } from 'class-validator';

export class AnswerCreateModel {
  @IsString({ message: 'Answer must be a string' })
  answer: string;
}
