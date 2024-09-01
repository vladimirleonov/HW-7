import { EnvironmentSettings } from './env-settings';
import { APISettings } from './api-settings';
import { ValidateNested, validateSync, ValidationError } from 'class-validator';
import { ConfigService } from '@nestjs/config';

export type EnvironmentVariable = { [key: string]: string };
export type ConfigurationType = Configuration;

export class Configuration {
  @ValidateNested()
  apiSettings: APISettings;
  @ValidateNested()
  environmentSettings: EnvironmentSettings;
  // Другие настройки...

  private constructor(configuration: Configuration) {
    Object.assign(this, configuration);
    this.apiSettings = configuration.apiSettings;
    this.environmentSettings = configuration.environmentSettings;
  }

  static createConfig(
    environmentVariables: Record<string, string>,
  ): Configuration {
    return new this({
      // Инициализация настроек
      apiSettings: new APISettings(environmentVariables),
      environmentSettings: new EnvironmentSettings(environmentVariables),
      // Другие настройки...
    });
  }
}

export function validate(environmentVariables: Record<string, string>) {
  const config: Configuration =
    Configuration.createConfig(environmentVariables);
  const errors: ValidationError[] = validateSync(config, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return config;
}

export default () => {
  const environmentVariables = process.env as EnvironmentVariable;
  console.log('process.env.ENV =', environmentVariables.ENV);
  return Configuration.createConfig(environmentVariables);
};
