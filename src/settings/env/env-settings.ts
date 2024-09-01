import { EnvironmentVariable } from './configuration';
import { IsEnum } from 'class-validator';

export enum EnvironmentsEnum {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  // 'production' variable is not accessible, because isProduction will work incorrectly
  PRODUCTION = 'PRODUCTION',
  TESTING = 'TESTING',
}

export class EnvironmentSettings {
  constructor(private readonly envVariables: EnvironmentVariable) {}

  @IsEnum(EnvironmentsEnum)
  private env = this.envVariables.ENV;

  getEnv() {
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isStaging() {
    return this.env === 'STAGING';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTesting() {
    return this.env === 'TESTING';
  }
}
