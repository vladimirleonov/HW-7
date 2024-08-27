import { IsString, Matches, MinLength } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class RegistrationEmailResendingModel {
  @IsString()
  @Trim()
  @MinLength(1, { message: 'Length not correct' })
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}
