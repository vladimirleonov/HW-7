import { IsString, IsUUID, Length, MinLength } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transformers/trim';

export class NewPasswordModel {
  @IsString()
  @Trim()
  @Length(6, 20, { message: 'Length not correct' })
  newPassword: string;
  @IsString()
  @Trim()
  @MinLength(1, { message: 'Length not correct' })
  @IsUUID(4, { message: 'UUID not correct' })
  recoveryCode: string;
}
