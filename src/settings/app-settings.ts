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
  public readonly ADMIN_LOGIN: string;
  public readonly ADMIN_PASSWORD: string;

  // Database
  public readonly MONGO_CONNECTION_URI: string;
  public readonly MONGO_CONNECTION_URI_FOR_TESTS: string;

  // Email
  public readonly EMAIL_USER: string;
  public readonly EMAIL_PASSWORD: string;
  public readonly EMAIL_HOST: string;
  public readonly EMAIL_PORT: string;

  // Jwt
  public readonly JWT_SECRET: string;
  public readonly JWT_EXPIRATION_TIME: string;

  constructor(private readonly envVariables: EnvironmentVariable) {
    // Application
    this.APP_PORT = this.getNumberOrDefault(envVariables.APP_PORT, 3001);
    this.HASH_ROUNDS = this.getNumberOrDefault(envVariables.HASH_ROUNDS, 10);
    this.ADMIN_LOGIN = envVariables.ADMIN_LOGIN ?? 'admin';
    this.ADMIN_PASSWORD = envVariables.ADMIN_PASSWORD ?? 'qwerty';

    // Database
    this.MONGO_CONNECTION_URI =
      envVariables.MONGO_CONNECTION_URI ??
      'mongodb+srv://vladimir777:4kuughy1HAimmtzO@cluster0.fgdxrtr.mongodb.net/blogger_db?retryWrites=true&w=majority&appName=Cluster0';
    this.MONGO_CONNECTION_URI_FOR_TESTS =
      envVariables.MONGO_CONNECTION_URI_FOR_TESTS ??
      //'mongodb://localhost:27017/yourDatabaseName';
      'mongodb+srv://vladimir777:4kuughy1HAimmtzO@cluster0.fgdxrtr.mongodb.net/blogger_db?retryWrites=true&w=majority&appName=Cluster0';

    // Email user data
    this.EMAIL_USER = envVariables.EMAIL_USER ?? 'alex0801white@gmail.com';
    this.EMAIL_PASSWORD =
      envVariables.EMAIL_USER_PASSWORD ?? 'cxdb mywx ufiz nlfa';
    this.EMAIL_HOST = envVariables.EMAIL_HOST ?? 'smtp.gmail.com';
    this.EMAIL_PORT = envVariables.EMAIL_PASSWORD ?? '587';

    //Jwt
    this.JWT_SECRET = envVariables.JWT_SECRET ?? 'secret';
    this.JWT_EXPIRATION_TIME = envVariables.JWT_EXPIRATION_TIME ?? '10h';
  }

  private getNumberOrDefault(value: any, defaultValue: number): number {
    const parsedValue: number = Number(value);

    if (isNaN(parsedValue)) {
      return defaultValue;
    }

    return parsedValue;
  }
}

const env: EnvironmentSettings = new EnvironmentSettings(
  (Environments.includes((process.env.ENV as string)?.trim())
    ? (process.env.ENV as string).trim()
    : 'DEVELOPMENT') as EnvironmentsTypes,
);

const api: APISettings = new APISettings(process.env);
export const appSettings: AppSettings = new AppSettings(env, api);
