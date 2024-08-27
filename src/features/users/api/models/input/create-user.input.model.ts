import { IsString, Length, MinLength } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';
import { LoginIsExist } from '../../../../../core/decorators/validate/login-is-exist.decorator';
import { EmailIsExist } from '../../../../../core/decorators/validate/email-is-exist.decorator';

export class UserCreateModel {
  @IsString()
  @Trim()
  @Length(3, 10, { message: 'Length not correct' })
  @LoginIsExist()
  login: string;
  @IsString()
  @Trim()
  @Length(6, 20, { message: 'Length not correct' })
  password: string;
  @IsString()
  @Trim()
  @MinLength(1, { message: 'Length not correct' })
  @EmailIsExist()
  email: string;
}
