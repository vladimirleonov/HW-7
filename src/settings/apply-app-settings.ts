import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';
import cookieParser from 'cookie-parser';
import {
  CustomExceptionFilter,
  HttpExceptionFilter,
} from '../core/exception-filters/http-exception-filter';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './env/configuration';

const APP_PREFIX = '/api';

// Используем данную функцию в main.ts и в e2e тестах
export const applyAppSettings = (app: INestApplication) => {
  // To implement dependencies in validator constraints
  // {fall back On Errors: true} required because Nest throws an exception,
  // when DI does not have the required class.
  // Configures the `class-validator` to use the dependency injection container
  // NestJS for resolving validator dependencies.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(cookieParser());

  setAppPrefix(app);

  setAppPipes(app);

  setAppExceptionsFilters(app);
};

const setAppPrefix = (app: INestApplication) => {
  app.setGlobalPrefix(APP_PREFIX);
};

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const customErrors: { field: string; message: string }[] = []; // { field: e.property, message: e.msg }

        errors.forEach((e) => {
          if (e.constraints) {
            const constraintsKeys = Object.keys(e.constraints);

            constraintsKeys.forEach((cKey: string, index: number) => {
              if (index >= 1) return;

              const msg = e.constraints?.[cKey] as any;

              customErrors.push({
                field: e.property,
                message: msg,
              });
            });
          }
        });

        throw new BadRequestException(customErrors);
      },
    }),
  );
};

const setAppExceptionsFilters = (app: INestApplication) => {
  const configService: ConfigService<ConfigurationType, true> = app.get(
    ConfigService<ConfigurationType, true>,
  );
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new CustomExceptionFilter(configService),
  );
};
