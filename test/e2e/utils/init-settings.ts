import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../../src/app.module';
import { deleteAllData } from './delete-all-data';
import { UsersTestManager } from '../features/users/users-test-manager';
import { applyAppSettings } from '../../../src/settings/apply-app-settings';
import { INestApplication } from '@nestjs/common';
import { AuthTestManager } from '../features/auth/auth-test-manager';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  // console.log('in tests ENV: ', appSettings.env.getEnv());
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });
  // .overrideProvider(UsersService)
  // .useValue(UserServiceMockObject);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app: INestApplication = testingAppModule.createNestApplication();

  // Применяем все настройки приложения (pipes, guards, filters, ...)
  applyAppSettings(app);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();

  // Init userManager, authManager
  const userTestManger: UsersTestManager = new UsersTestManager(app);
  const authTestManager: AuthTestManager = new AuthTestManager(app);

  await deleteAllData(databaseConnection);

  //TODO:переписать через setState

  // return {
  //   app,
  //   databaseConnection,
  //   httpServer,
  //   userTestManger,
  //   authTestManager
  // };

  // Работа с состоянием
  expect.setState({
    app: app,
    databaseConnection: databaseConnection,
    httpServer: httpServer,
    userTestManger: userTestManger,
    authTestManager: authTestManager,
  });
};
