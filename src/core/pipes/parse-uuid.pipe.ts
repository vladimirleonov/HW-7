import { Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { NotFoundException } from '../exception-filters/http-exception-filter';

@Injectable()
export class ParseUUIDPipe implements PipeTransform {
  transform(value: string) {
    if (!isUUID(value)) {
      throw new NotFoundException('Invalid device id');
    }
    return value;
  }
}
