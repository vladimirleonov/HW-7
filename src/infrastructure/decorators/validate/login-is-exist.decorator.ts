import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../features/users/infrastructure/users.repository';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';

// Обязательна регистрация в ioc
@ValidatorConstraint({ name: 'LoginIsExist', async: true })
@Injectable()
export class LoginIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  // validation logic
  async validate(login: string, validationArguments?: ValidationArguments) {
    const user = await this.usersRepository.findByField('login', login); // Checking if comment belongs to selected user

    if (!user) {
      return true;
    }
    return false;
  }

  // default error message
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Login ${validationArguments?.value} already exists`;
  }
}

// decorator
// https://github.com/typestack/class-validator?tab=readme-ov-file#custom-validation-decorators
export function LoginIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: LoginIsExistConstraint,
    });
  };
}
