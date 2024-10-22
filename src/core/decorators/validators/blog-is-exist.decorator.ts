import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { BlogsTypeormRepository } from '../../../features/content/blogs/infrastructure/typeorm/blogs-typeorm.repository';

@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(
    private readonly blogsTypeormRepository: BlogsTypeormRepository,
  ) {}

  async validate(blogId: number) {
    const blog = await this.blogsTypeormRepository.findById(blogId);

    // the same as blog ? false : true
    return !blog;
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
