// https://docs.nestjs.com/techniques/configuration#custom-configuration-files

import { ValidateNested, validateSync } from 'class-validator';
import { ApiSettings } from './api-settings';
import { EnvironmentSettings } from './env-settings';

export type EnvironmentVariable = { [key: string]: string };
export type ConfigurationType = Configuration;

export class Configuration {
  @ValidateNested()
  apiSettings: ApiSettings;
  @ValidateNested()
  environmentSettings: EnvironmentSettings;

  private constructor(configuration: Configuration) {
    Object.assign(this, configuration);
  }

  static createConfig(
    environmentVariables: Record<string, string>,
  ): Configuration {
    return new this({
      apiSettings: new ApiSettings(environmentVariables),
      environmentSettings: new EnvironmentSettings(environmentVariables),
    });
  }
}

export function validate(environmentVariables: Record<string, string>) {
  const config = Configuration.createConfig(environmentVariables);

  const errors = validateSync(config, { skipMissingProperties: false });

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
