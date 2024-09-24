import { DynamicModule, Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';
import { TestingService } from './application/testing.service';
import { TestingRepository } from './infrastructure/testing.repository';

@Module({})
export class TestingModule {
  static register(): DynamicModule {
    console.log('TestingModule is registered');
    if (process.env.ENV !== 'PRODUCTION') {
      console.log('in if PRODUCTION!!!');
      return {
        module: TestingModule,
        imports: [],
        controllers: [TestingController],
        providers: [TestingService, TestingRepository],
      };
    }

    console.log('TestingModule is registered');

    return {
      module: TestingModule,
      imports: [],
      controllers: [],
      providers: [],
    };

    // console.log(process.env.ENV);
    //
    // return {
    //   module: TestingModule,
    //   imports: [],
    //   controllers: [TestingController],
    //   providers: [TestingService, TestingRepository],
    // };
  }
}
