import { IsString, Length, Matches, MinLength } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformers/trim';
// import { LoginIsExist } from '../../../../../core/decorators/validators/login-is-exist.decorator';
import { EmailIsExist } from '../../../../../core/decorators/validators/email-is-exist.decorator';

export class UserCreateModel {
  @IsString()
  @Trim()
  @Length(3, 10, { message: 'Length not correct' })
  // @LoginIsExist()
  login: string;
  @IsString()
  @Trim()
  @Length(6, 20, { message: 'Length not correct' })
  password: string;
  @IsString()
  @Trim()
  @MinLength(1, { message: 'Length not correct' })
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @EmailIsExist()
  email: string;
}
