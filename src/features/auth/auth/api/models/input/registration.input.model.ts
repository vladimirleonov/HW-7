import { IsString, Length, Matches, MinLength } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transform/trim';

export class RegistrationModel {
  @IsString()
  @Trim()
  @Length(3, 10, { message: 'Length not correct' })
  login: string;
  @IsString()
  @Trim()
  @Length(6, 20, { message: 'Length not correct' })
  password: string;
  @IsString()
  @Trim()
  @MinLength(1, { message: 'Length not correct' })
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}
