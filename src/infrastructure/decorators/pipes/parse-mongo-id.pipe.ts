import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isMongoId } from 'class-validator';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any): string {
    if (!isMongoId(value)) {
      throw new BadRequestException('Invalid MongoDB ID');
    }
    return value;
  }
}
