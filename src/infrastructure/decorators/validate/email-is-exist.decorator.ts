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
@ValidatorConstraint({ name: 'EmailIsExist', async: true })
@Injectable()
export class EmailIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  // validation logic
  async validate(email: string, validationArguments?: ValidationArguments) {
    const user = await this.usersRepository.findByField('email', email); // Checking if user with email already exists

    if (!user) {
      return true;
    }
    return false;
  }

  // default error message
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Email ${validationArguments?.value} already exists`;
  }
}

// decorator
// https://github.com/typestack/class-validator?tab=readme-ov-file#custom-validation-decorators
export function EmailIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: EmailIsExistConstraint,
    });
  };
}
