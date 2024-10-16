import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { UsersTypeormRepository } from '../../../features/users/infrastructure/typeorm/users-typeorm.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../features/users/domain/user.entity';

@ValidatorConstraint({ name: 'EmailIsExist', async: true })
@Injectable()
export class EmailIsExistConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly usersTypeormRepository: UsersTypeormRepository,
  ) {}

  async validate(email: string) {
    // const user = await this.usersPostgresRepository.findByField('email', email); // Checking if user with email already exists
    const user = await this.usersRepository.findOneBy({ email });

    // the same as user ? false : true
    return !user;
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
