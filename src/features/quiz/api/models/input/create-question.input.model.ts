import { IsArray, IsString, Length } from 'class-validator';

export class QuestionCreateModel {
  @IsString({ message: 'Body must be a string' })
  @Length(10, 500, { message: 'Length not correct' })
  body: string;

  @IsArray({ message: 'Correct answers must be an array' })
  @IsString({ each: true, message: 'Each correct answer must be a string' })
  correctAnswers: string[];
}
