import { IsString, MinLength } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transform/trim';

export class PasswordRecoveryModel {
  @IsString()
  @Trim()
  @MinLength(1, { message: 'Length not correct' })
  email: string;
}
