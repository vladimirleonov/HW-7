import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppSettings } from './settings/apply-app-settings';
import { ConfigService } from '@nestjs/config';
import { Configuration, ConfigurationType } from './settings/env/configuration';
import { ApiSettings } from './settings/env/api-settings';
import { EnvironmentSettings } from './settings/env/env-settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // apply all app settings (pipes, guards, filters, ...)
  applyAppSettings(app);

  const configService: ConfigService<Configuration, true> = app.get(
    ConfigService<ConfigurationType, true>,
  );
  const apiSettings: ApiSettings = configService.get('apiSettings', {
    infer: true,
  });
  const environmentSettings: EnvironmentSettings = configService.get(
    'environmentSettings',
    {
      infer: true,
    },
  );
  const port: number = apiSettings.APP_PORT;

  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('ENV: ', environmentSettings.currentEnv);
  });
}
bootstrap();
