import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { UsersPostgresRepository } from '../../../features/users/infrastructure/postgresql/users-postgres.repository';

@ValidatorConstraint({ name: 'EmailIsExist', async: true })
@Injectable()
export class EmailIsExistConstraint implements ValidatorConstraintInterface {
  constructor(
    private readonly usersPostgresRepository: UsersPostgresRepository,
  ) {}

  async validate(email: string) {
    const user = await this.usersPostgresRepository.findByField('email', email); // Checking if user with email already exists

    if (!user) return true;

    return false;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Email ${validationArguments?.value} already exists`;
  }
}

export function EmailIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: EmailIsExistConstraint,
    });
  };
}
