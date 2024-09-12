import { IsString, Length, MinLength } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transformers/trim';
import { BlogIsExist } from '../../../../../../core/decorators/validators/blog-is-exist.decorator';

export class PostCreateModel {
  @IsString()
  @Trim()
  @Length(1, 30, { message: 'Length not correct' })
  title: string;
  @IsString()
  @Trim()
  @Length(1, 100, { message: 'Length not correct' })
  shortDescription: string;
  @IsString()
  @Trim()
  @Length(1, 1000, { message: 'Length not correct' })
  content: string;
  @IsString()
  @Trim()
  @MinLength(1, { message: 'Length not correct' })
  @BlogIsExist()
  blogId: string;
}
