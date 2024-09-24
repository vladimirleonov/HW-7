import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { BlogsPostgresRepository } from '../../../features/content/blogs/infrastructure/postgres/blogs-postgres.repository';
// import { BlogsPostgresRepository } from '../../../features/content/blogs/infrastructure/blogs.repository';

@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(
    private readonly blogsPostgresRepository: BlogsPostgresRepository,
  ) {}

  async validate(blogId: string) {
    console.log('check blog is exist!!!');
    const blog = await this.blogsPostgresRepository.findById(blogId); // Checking if blog exist

    if (!blog) return false;

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Blog  with id ${validationArguments?.value} does not exist`;
  }
}

export function BlogIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIsExistConstraint,
    });
  };
}
