import { IsEmail, MinLength } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transformers/trim';

export class PasswordRecoveryModel {
  @IsEmail()
  @Trim()
  @MinLength(1, { message: 'Length not correct' })
  email: string;
}
