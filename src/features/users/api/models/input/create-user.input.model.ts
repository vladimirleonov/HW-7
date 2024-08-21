import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../../infrastructure/decorators/transform/trim';
import { LoginIsExist } from '../../../../../infrastructure/decorators/validate/login-is-exist.decorator';
import { EmailIsExist } from '../../../../../infrastructure/decorators/validate/email-is-exist.decorator';

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
  @Length(3, 10, { message: 'Length not correct' })
  @EmailIsExist()
  email: string;
}
