import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transformers/trim';

export class CommentCreateModel {
  @IsString()
  @Trim()
  @Length(20, 300, { message: 'Length not correct' })
  content: string;
}
