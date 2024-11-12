import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { applyAppSettings } from '../../../src/settings/apply-app-settings';

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

  // state
  expect.setState({
    app: app,
  });
};
