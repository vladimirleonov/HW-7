import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { applyAppSettings } from '../../../src/settings/apply-app-settings';
import { DataSource } from 'typeorm';
import { QuestionTestManager } from '../features/quiz/question/question-test-manager';
import { UsersTestManager } from '../features/quiz/pairs/users-test-manager';
import { PairsTestManager } from '../features/quiz/pairs/pairs-test-manager';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  // if passed addSettingsToModuleBuilder function, give it our testingModule to change it
  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app: INestApplication = testingAppModule.createNestApplication();

  // apply all app settings like (pipes, guards, filters, ...)
  applyAppSettings(app);

  await app.init();

  // get dataSource to delete tables data in tests
  const dataSource: DataSource = app.get<DataSource>(DataSource);

  // Init questionTestManger
  const questionTestManager: QuestionTestManager = new QuestionTestManager(app);

  // Init usersTestManager
  const usersTestManager: UsersTestManager = new UsersTestManager(app);

  // Init usersTestManager
  const pairsTestManager: PairsTestManager = new PairsTestManager(app);

  // state
  expect.setState({
    app: app,
    dataSource: dataSource,
    questionTestManger: questionTestManager,
    usersTestManager: usersTestManager,
    pairsTestManager: pairsTestManager,
  });
};
