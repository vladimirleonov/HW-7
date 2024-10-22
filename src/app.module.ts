import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ConfigurationType } from './settings/env/configuration';
import { JwtModule } from '@nestjs/jwt';
import { ApiSettings } from './settings/env/api-settings';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './features/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './features/auth/auth.module';
import { TestingModule } from './features/testing/testing.module';
import { ContentModule } from './features/content/content.module';
import { User } from './features/users/domain/user.entity';
import { DatabaseSettings } from './settings/env/database-settings';
import { EmailConfirmation } from './features/users/domain/email-confirmation';
import { PasswordRecovery } from './features/users/domain/password-recovery';
import { Device } from './features/auth/security/domain/device.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      // validators: validators,
      // ignoreEnvFile:
      //   process.env.ENV !== Environments.DEVELOPMENT &&
      //   process.env.ENV !== Environments.TESTING,arn run start:dev
      envFilePath: ['.env.development', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const databaseSettings: DatabaseSettings =
          configService.get<DatabaseSettings>('databaseSettings');

        return {
          type: databaseSettings.DB_TYPE as 'postgres',
          host: databaseSettings.DB_HOST,
          port: databaseSettings.DB_PORT,
          username: databaseSettings.DB_USERNAME,
          password: databaseSettings.DB_PASSWORD,
          database: databaseSettings.DB_DATABASE,
          entities: [User, EmailConfirmation, PasswordRecovery, Device],
          synchronize: true,
          logging: true,
          namingStrategy: new SnakeNamingStrategy(),
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const apiSettings: ApiSettings =
          configService.get<ApiSettings>('apiSettings');

        return {
          global: true,
          throttlers: [
            {
              ttl: apiSettings.THROTTLE_TTL_MS,
              limit: apiSettings.THROTTLE_MAX_REQUESTS,
            },
          ],
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const apiSettings: ApiSettings =
          configService.get<ApiSettings>('apiSettings');

        return {
          global: true,
          secret: apiSettings.JWT_SECRET,
          signOptions: {
            expiresIn: apiSettings.JWT_EXPIRATION_TIME,
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ContentModule,
    TestingModule.register(),
  ],
  providers: [
    // REGISTER EXAMPLES
    /* {
      provide: UsersService,
      useClass: UsersService,
    },*/
    /* {
      provide: AppSettings,
      useValue: appSettings,
    },*/
    /*{
      provide: UsersService,
      useValue: {method: () => {}},
    },*/
    /* Регистрация с помощью useFactory (необходимы зависимости из ioc, подбор провайдера, ...)
    {
      provide: UsersService,
      useFactory: (repo: UsersMongoRepository, authService: AuthService) => {
        return new UsersService(repo, authService);
      },
      inject: [UsersMongoRepository, AuthService]
    }*/
  ],
})
export class AppModule {}
