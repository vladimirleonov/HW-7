import { IsString, Length, MinLength } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class LoginModel {
  @IsString()
  @Trim()
  @MinLength(1, { message: 'Length not correct' })
  loginOrEmail: string;
  @IsString()
  @Trim()
  @Length(6, 20, { message: 'Length not correct' })
  password: string;
}
