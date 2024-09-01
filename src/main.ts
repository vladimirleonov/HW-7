import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppSettings } from './settings/apply-app-settings';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './settings/env/configuration';
import { APISettings } from './settings/env/api-settings';
import { EnvironmentSettings } from './settings/env/env-settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // apply all app settings (pipes, guards, filters, ...)
  applyAppSettings(app);

  const configService: ConfigService<ConfigurationType, true> = app.get(
    ConfigService<ConfigurationType, true>,
  );
  // { infer: true } - output type
  const apiSettings: APISettings = configService.get('apiSettings', {
    infer: true,
  });
  const environmentSettings: EnvironmentSettings = configService.get(
    'environmentSettings',
    { infer: true },
  );

  await app.listen(apiSettings.APP_PORT, () => {
    console.log('App starting listen port: ', apiSettings.APP_PORT);
    console.log('ENV: ', environmentSettings.getEnv());
  });
}
bootstrap();
