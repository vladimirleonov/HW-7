import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transform/trim';

export class CommentUpdateModel {
  @IsString()
  @Trim()
  @Length(20, 300, { message: 'Length not correct' })
  content: string;
}
