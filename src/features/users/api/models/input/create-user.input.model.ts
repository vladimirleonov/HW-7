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

const userEmailInputValidator = body('email')
  .isString()
  .withMessage('email is missing or not a string')
  .trim()
  .isLength({ min: 1 })
  .withMessage('email is required')
  .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);

export const userInputValidator = [
  userLoginInputValidator,
  userPasswordInputValidator,
  userEmailInputValidator,
];
