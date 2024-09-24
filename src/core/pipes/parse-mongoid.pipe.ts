// import { Injectable, PipeTransform } from '@nestjs/common';
// import { isMongoId } from 'class-validator';
// import { NotFoundException } from '../exception-filters/http-exception-filter';
//
// @Injectable()
// export class ParseMongoidPipe implements PipeTransform {
//   transform(value: any): string {
//     if (!isMongoId(value)) {
//       throw new NotFoundException('Invalid mongo id');
//     }
//     return value;
//   }
// }
