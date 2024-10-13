import { EnvironmentVariable } from './configuration';
import { IsNumber, IsString } from 'class-validator';

export class DatabaseSettings {
  constructor(private envVariables: EnvironmentVariable) {}

  @IsString()
  DB_TYPE: string = this.envVariables.DB_TYPE;
  @IsString()
  DB_HOST: string = this.envVariables.DB_HOST;
  @IsNumber()
  DB_PORT: number = Number(this.envVariables.DB_PORT);
  @IsString()
  DB_USERNAME: string = this.envVariables.DB_USERNAME;
  @IsString()
  DB_PASSWORD: string = this.envVariables.DB_PASSWORD;
  @IsString()
  DB_DATABASE: string = this.envVariables.DB_DATABASE;
}
