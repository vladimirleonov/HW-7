import { IsString, IsUUID, MinLength } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transformers/trim';

export class ConfirmRegistrationModel {
  @IsString()
  @Trim()
  @MinLength(1, { message: 'Length not correct' })
  @IsUUID(4, { message: 'UUID not correct' })
  code: string;
}
