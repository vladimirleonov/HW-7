import { EnvironmentVariable } from './configuration';
import { IsNumber, IsString } from 'class-validator';
import { Optional } from '@nestjs/common';

export class ApiSettings {
  constructor(private envVariables: EnvironmentVariable) {}
  // Application
  @IsNumber()
  APP_PORT: number = Number(this.envVariables.APP_PORT);
  //используется только в тестовом окружении - значение берем из .env
  @IsNumber()
  HASH_ROUNDS: number = Number(this.envVariables.HASH_ROUNDS);
  @IsString()
  ADMIN_LOGIN: string = this.envVariables.ADMIN_LOGIN;
  @IsString()
  ADMIN_PASSWORD: string = this.envVariables.ADMIN_PASSWORD;

  // Database
  @IsString()
  MONGO_CONNECTION_URI: string = this.envVariables.MONGO_CONNECTION_URI;
  @IsString()
  @Optional()
  MONGO_CONNECTION_URI_FOR_TESTS: string =
    this.envVariables.MONGO_CONNECTION_URI_FOR_TESTS;

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
  public readonly JWT_SECRET: string = this.envVariables.JWT_SECRET;
  @IsString()
  public readonly JWT_EXPIRATION_TIME: string =
    this.envVariables.JWT_EXPIRATION_TIME;
}
