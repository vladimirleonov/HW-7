import { EnvironmentVariable } from './configuration';
import { IsEnum } from 'class-validator';

export enum Environments {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
  TESTING = 'TESTING',
}
export class EnvironmentSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsEnum(Environments)
  private ENV = this.environmentVariables.ENV;
  get isProduction() {
    return this.environmentVariables.ENV === Environments.PRODUCTION;
  }
  get isStaging() {
    return this.environmentVariables.ENV === Environments.STAGING;
  }
  get isTesting() {
    return this.environmentVariables.ENV === Environments.TESTING;
  }
  get isDevelopment() {
    return this.environmentVariables.ENV === Environments.DEVELOPMENT;
  }
  get currentEnv() {
    return this.ENV;
  }
}
