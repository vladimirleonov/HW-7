import { EnvironmentVariable } from './configuration';
import { IsNumber, IsString } from 'class-validator';
import { Optional } from '@nestjs/common';

export class ApiSettings {
  constructor(private envVariables: EnvironmentVariable) {}
  // Application
  @IsNumber()
  APP_PORT: number = Number(this.envVariables.APP_PORT);
  // используется только в тестовом окружении - значение берем из .env
  @IsNumber()
  HASH_ROUNDS: number = Number(this.envVariables.HASH_ROUNDS);
  @IsString()
  ADMIN_LOGIN: string = this.envVariables.ADMIN_LOGIN;
  @IsString()
  ADMIN_PASSWORD: string = this.envVariables.ADMIN_PASSWORD;

  // Mongo settings
  @IsString()
  MONGO_CONNECTION_URI: string = this.envVariables.MONGO_CONNECTION_URI;
  @IsString()
  @Optional()
  MONGO_CONNECTION_URI_FOR_TESTS: string =
    this.envVariables.MONGO_CONNECTION_URI_FOR_TESTS;

  // Postgres settings
  @IsString()
  DB_TYPE: string = this.envVariables.DB_TYPE;
  @IsString()
  DB_HOST: string = this.envVariables.DB_HOST;
  @IsString()
  DB_PORT: string = this.envVariables.DB_PORT;
  @IsString()
  DB_USERNAME: string = this.envVariables.DB_USERNAME;
  @IsString()
  DB_PASSWORD: string = this.envVariables.DB_PASSWORD;
  @IsString()
  DB_DATABASE: string = this.envVariables.DB_DATABASE;

  // Email
  @IsString()
  EMAIL_USER: string = this.envVariables.EMAIL_USER;
  @IsString()
  EMAIL_PASSWORD: string = this.envVariables.EMAIL_PASSWORD;
  @IsString()
  EMAIL_HOST: string = this.envVariables.EMAIL_HOST;
  @IsString()
  EMAIL_PORT: string = this.envVariables.EMAIL_PORT;

  // Jwt
  @IsString()
  JWT_SECRET: string = this.envVariables.JWT_SECRET;
  @IsString()
  JWT_EXPIRATION_TIME: string = this.envVariables.JWT_EXPIRATION_TIME;

  // Rate limit ThrottlerModule settings
  @IsNumber()
  THROTTLE_TTL_MS: number = Number(this.envVariables.THROTTLE_TTL_MS);
  THROTTLE_MAX_REQUESTS: number = Number(
    this.envVariables.THROTTLE_MAX_REQUESTS,
  );
}
