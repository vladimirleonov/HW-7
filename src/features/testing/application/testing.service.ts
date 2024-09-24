import { Injectable } from '@nestjs/common';
import { TestingRepository } from '../infrastructure/testing.repository';

@Injectable()
export class TestingService {
  constructor(private readonly testingRepository: TestingRepository) {}

  deleteAllData() {
    return this.testingRepository.deleteAllData();
  }
}
