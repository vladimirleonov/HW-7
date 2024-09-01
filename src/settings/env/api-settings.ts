import { EnvironmentVariable } from './configuration';
import { IsNumber, IsString, Length } from 'class-validator';
import { Optional } from '@nestjs/common';

export class APISettings {
  constructor(private readonly envVariables: EnvironmentVariable) {}

  // Application
  @IsNumber()
  public readonly APP_PORT: number = Number(this.envVariables.APP_PORT);
  @IsNumber()
  public readonly HASH_ROUNDS: number = Number(this.envVariables.HASH_ROUNDS);
  @IsString()
  public readonly ADMIN_LOGIN: string = this.envVariables.ADMIN_LOGIN;
  @IsString()
  public readonly ADMIN_PASSWORD: string = this.envVariables.ADMIN_PASSWORD;

  // Database
  @IsString()
  public readonly MONGO_CONNECTION_URI: string =
    this.envVariables.MONGO_CONNECTION_URI;
  @IsString()
  @Optional()
  public readonly MONGO_CONNECTION_URI_FOR_TESTS: string =
    this.envVariables.MONGO_CONNECTION_URI_FOR_TESTS;

  // Email
  @IsString()
  public readonly EMAIL_USER: string = this.envVariables.EMAIL_USER;
  @IsString()
  public readonly EMAIL_PASSWORD: string = this.envVariables.EMAIL_PASSWORD;
  @IsString()
  public readonly EMAIL_HOST: string = this.envVariables.EMAIL_HOST;
  @IsString()
  public readonly EMAIL_PORT: string = this.envVariables.EMAIL_PORT;

  // Jwt
  @IsString()
  public readonly JWT_SECRET: string = this.envVariables.JWT_SECRET;
  @IsString()
  public readonly JWT_EXPIRATION_TIME: string =
    this.envVariables.JWT_EXPIRATION_TIME;
}
