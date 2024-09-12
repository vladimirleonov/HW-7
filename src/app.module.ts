import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ConfigurationType } from './settings/env/configuration';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentSettings } from './settings/env/env-settings';
import { ApiSettings } from './settings/env/api-settings';
import { ThrottlerModule } from '@nestjs/throttler';
import { TestingModule } from './features/testing/testing.module';
import { ContentModule } from './features/content/content.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';

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
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const apiSettings: ApiSettings = configService.get('apiSettings', {
          infer: true,
        });
        const environmentSettings: EnvironmentSettings = configService.get(
          'environmentSettings',
          { infer: true },
        );

        const uri: string = environmentSettings.isTesting
          ? apiSettings.MONGO_CONNECTION_URI_FOR_TESTS
          : apiSettings.MONGO_CONNECTION_URI;

        return {
          uri,
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
      useFactory: (repo: UsersRepository, authService: AuthService) => {
        return new UsersService(repo, authService);
      },
      inject: [UsersRepository, AuthService]
    }*/
  ],
})
export class AppModule {}
