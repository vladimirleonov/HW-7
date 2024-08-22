import { config } from 'dotenv';

config();

export type EnvironmentVariable = { [key: string]: string | undefined };
export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';
export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) {}

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

export class AppSettings {
  constructor(
    public env: EnvironmentSettings,
    public api: APISettings,
  ) {}
}

class APISettings {
  // Application
  public readonly APP_PORT: number;
  public readonly HASH_ROUNDS: number;

  // Database
  public readonly MONGO_CONNECTION_URI: string;
  public readonly MONGO_CONNECTION_URI_FOR_TESTS: string;

  // JWT
  public readonly JWT_SECRET: string;

  constructor(private readonly envVariables: EnvironmentVariable) {
    // Application
    this.APP_PORT = this.getNumberOrDefault(envVariables.APP_PORT, 3001);
    this.HASH_ROUNDS = this.getNumberOrDefault(envVariables.HASH_ROUNDS, 10);

    // Database
    this.MONGO_CONNECTION_URI =
      envVariables.MONGO_CONNECTION_URI ??
      'mongodb+srv://vladimir777:4kuughy1HAimmtzO@cluster0.fgdxrtr.mongodb.net/blogger_db?retryWrites=true&w=majority&appName=Cluster0';
    this.MONGO_CONNECTION_URI_FOR_TESTS =
      envVariables.MONGO_CONNECTION_URI_FOR_TESTS ?? 'mongodb://localhost/test';

    //JWT
    this.JWT_SECRET = envVariables.JWT_SECRET ?? 'secret';
  }

  private getNumberOrDefault(value: any, defaultValue: number): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      return defaultValue;
    }

    return parsedValue;
  }
}

const env = new EnvironmentSettings(
  (Environments.includes((process.env.ENV as string)?.trim())
    ? (process.env.ENV as string).trim()
    : 'DEVELOPMENT') as EnvironmentsTypes,
);

const api = new APISettings(process.env);
export const appSettings: AppSettings = new AppSettings(env, api);
