// import {
//   registerDecorator,
//   ValidationOptions,
//   ValidatorConstraint,
//   ValidatorConstraintInterface,
// } from 'class-validator';
// import { Injectable } from '@nestjs/common';
// import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
// import { UsersPostgresqlRepository } from '../../../features/users/infrastructure/postgresql/users-postgresql.repository';
//
// @ValidatorConstraint({ name: 'LoginIsExist', async: true })
// @Injectable()
// export class LoginIsExistConstraint implements ValidatorConstraintInterface {
//   constructor(
//     // private readonly usersRepository: UsersMongoRepository
//     private readonly usersPostgresqlRepository: UsersPostgresqlRepository,
//   ) {}
//
//   async validate(login: string) {
//     const user = await this.usersPostgresqlRepository.findByField(
//       'login',
//       login,
//     ); // Checking if user with login already exists
//
//     if (!user) return true;
//
//     return false;
//   }
//
//   defaultMessage(validationArguments?: ValidationArguments): string {
//     return `Login ${validationArguments?.value} already exists`;
//   }
// }
//
// export function LoginIsExist(
//   property?: string,
//   validationOptions?: ValidationOptions,
// ) {
//   return function (object: object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       constraints: [property],
//       validator: LoginIsExistConstraint,
//     });
//   };
// }
