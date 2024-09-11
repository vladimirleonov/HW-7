import { DynamicModule, Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';
import { TestingService } from './application/testing.service';
import { TestingRepository } from './infrastructure/testing.repository';

@Module({})
export class TestingModule {
  static register(): DynamicModule {
    if (process.env.ENV !== 'PRODUCTION') {
      return {
        module: TestingModule,
        imports: [],
        controllers: [TestingController],
        providers: [TestingService, TestingRepository],
      };
    }

    return {
      module: TestingModule,
      imports: [],
      controllers: [],
      providers: [],
    };
  }
}
