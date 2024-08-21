import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { BlogsRepository } from '../../../features/blogs/infrastructure/blogs.repository';

// Обязательна регистрация в ioc
@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  // validation logic
  async validate(blogId: string, validationArguments?: ValidationArguments) {
    const blog = await this.blogsRepository.findById(blogId); // Checking if blog exist

    if (!blog) {
      return false;
    }
    return true;
  }

  // default error message
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Blog  with id ${validationArguments?.value} does not exist`;
  }
}

// decorator
// https://github.com/typestack/class-validator?tab=readme-ov-file#custom-validation-decorators
export function BlogIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIsExistConstraint,
    });
  };
}
