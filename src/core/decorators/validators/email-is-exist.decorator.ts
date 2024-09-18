import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
// import { UsersMongoRepository } from '../../../features/users/infrastructure/mongo/users-mongo.repository';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';

@ValidatorConstraint({ name: 'EmailIsExist', async: true })
@Injectable()
export class EmailIsExistConstraint implements ValidatorConstraintInterface {
  constructor() {} // private readonly usersRepository: UsersMongoRepository

  async validate(email: string) {
    //   const user = await this.usersRepository.findByField('email', email); // Checking if user with email already exists
    //
    //   if (!user) return true;
    //
    //   return false;
    // }
    //
    // defaultMessage(validationArguments?: ValidationArguments): string {
    //   return `Email ${validationArguments?.value} already exists`;
    return true;
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
