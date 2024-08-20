import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../../infrastructure/decorators/transform/trim';

export class UserCreateModel {
  @IsString()
  @Trim()
  @Length(3, 10, { message: 'Length not correct' })
  login: string;
  password: string;
  email: string;
}
