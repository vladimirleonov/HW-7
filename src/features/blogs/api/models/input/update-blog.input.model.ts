import { IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class BlogUpdateModel {
  @IsString()
  @Trim()
  @Length(1, 15, { message: 'Length not correct' })
  name: string;
  @IsString()
  @Trim()
  @Length(1, 500, { message: 'Length not correct' })
  description: string;
  @IsString()
  @Trim()
  @Length(1, 100, { message: 'Length not correct' })
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
