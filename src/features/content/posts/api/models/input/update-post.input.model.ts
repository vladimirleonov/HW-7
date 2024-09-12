import { IsString, Length, MinLength } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transform/trim';
import { BlogIsExist } from '../../../../../../core/decorators/validate/blog-is-exist.decorator';

export class PostUpdateModel {
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
