import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './features/users/api/users.controller';
import { UsersService } from './features/users/application/users.service';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { UsersQueryRepository } from './features/users/infrastructure/users.query-repository';
import { User, UserSchema } from './features/users/domain/user.entity';
import { AuthService } from './features/auth/application/auth.service';
import { BlogsController } from './features/blogs/api/blogs.controller';
import { BlogsService } from './features/blogs/application/blogs.service';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository';
import { Blog, BlogSchema } from './features/blogs/domain/blog.entity';
import { Post, PostSchema } from './features/posts/domain/post.entity';
import { PostsController } from './features/posts/api/posts.controller';
import { PostsService } from './features/posts/application/posts.service';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query-repository';
import { TestingService } from './features/testing/application/testing.service';
import { TestingRepository } from './features/testing/infrastructure/testing.repository';
import { TestingController } from './features/testing/api/testing.controller';
import { Device, DeviceSchema } from './features/security/domain/device.entity';
import { DeviceRepository } from './features/security/infrastructure/device.repository';
import { AuthController } from './features/auth/api/auth.controller';
import { SecurityService } from './features/security/application/security.service';
import { ApiAccessLogsRepository } from './features/auth/infrastructure/api-access-logs.repository';
import {
  ApiAccessLog,
  ApiAccessLogSchema,
} from './features/auth/domain/api-access-log.entity';
import { UtilsService } from './core/application/utils.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from './core/application/crypto.service';
import { NodemailerService } from './core/application/nodemailer.service';
import { LoginIsExistConstraint } from './core/decorators/validate/login-is-exist.decorator';
import { EmailIsExistConstraint } from './core/decorators/validate/email-is-exist.decorator';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, {
  ConfigurationType,
  validate,
} from './settings/env/configuration';
import { LocalStrategy } from './core/stratagies/local.strategy';
import { JwtStrategy } from './core/stratagies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { BasicStrategy } from './core/stratagies/basic.strategy';
import { RefreshTokenStrategy } from './core/stratagies/refresh-token.strategy';
import { APISettings } from './settings/env/api-settings';
import { EnvironmentSettings } from './settings/env/env-settings';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './features/users/application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from './features/users/application/use-cases/delete-user.usecase';
import { CreatePostCommandUseCase } from './features/posts/application/use-cases/create-post.usecase';
import { UpdatePostUseCase } from './features/posts/application/use-cases/update-post.usecase';
import { DeletePostUseCase } from './features/posts/application/use-cases/delete-post.usecase';
import { CreateBlogUseCase } from './features/blogs/application/use-cases/create-blog.usecase';
import {
  UpdateBlogCommand,
  UpdateBlogUseCase,
} from './features/blogs/application/use-cases/update-blog.usecase';
import { DeleteBlogUseCase } from './features/blogs/application/use-cases/delete-blog.usecase';

const strategyProviders: Provider[] = [
  LocalStrategy,
  JwtStrategy,
  BasicStrategy,
  RefreshTokenStrategy,
];

const basicProviders: Provider[] = [
  UtilsService,
  JwtService,
  CryptoService,
  NodemailerService,
];

const authProviders: Provider[] = [AuthService, ApiAccessLogsRepository];

const securityProviders: Provider[] = [SecurityService, DeviceRepository];

const usersProviders: Provider[] = [
  CreateUserUseCase,
  DeleteUserUseCase,
  UsersService,
  UsersRepository,
  UsersQueryRepository,
];

const blogsProviders: Provider[] = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  BlogsService,
  BlogsRepository,
  BlogsQueryRepository,
];

const postsProviders: Provider[] = [
  CreatePostCommandUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  PostsService,
  PostsRepository,
  PostsQueryRepository,
];

const testingProviders: Provider[] = [TestingService, TestingRepository];

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validate,
      // ignoreEnvFile:
      //   process.env.ENV !== EnvironmentsEnum.DEVELOPMENT &&
      //   process.env.ENV !== EnvironmentsEnum.TESTING,
      envFilePath: ['.env.development', '.env'], // -> right
    }),
    // JwtModule.register({
    //   secret: appSettings.api.JWT_SECRET,
    //   signOptions: { expiresIn: appSettings.api.JWT_EXPIRATION_TIME },
    // }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const apiSettings: APISettings = configService.get('apiSettings', {
          infer: true,
        });

        return {
          secret: apiSettings.JWT_SECRET,
          signOptions: {
            expiresIn: apiSettings.JWT_EXPIRATION_TIME,
          },
        };
      },
      inject: [ConfigService],
    }),
    // MongooseModule.forRoot(
    //   appSettings.env.isTesting()
    //     ? appSettings.api.MONGO_CONNECTION_URI_FOR_TESTS
    //     : appSettings.api.MONGO_CONNECTION_URI,
    // ),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const apiSettings: APISettings = configService.get('apiSettings', {
          infer: true,
        });
        const environmentSettings: EnvironmentSettings = configService.get(
          'environmentSettings',
          { infer: true },
        );

        const uri: string = environmentSettings.isTesting()
          ? apiSettings.MONGO_CONNECTION_URI_FOR_TESTS
          : apiSettings.MONGO_CONNECTION_URI;

        console.log(uri);

        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: ApiAccessLog.name, schema: ApiAccessLogSchema },
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    BlogsController,
    PostsController,
    TestingController,
  ],
  providers: [
    ...authProviders,
    ...securityProviders,
    ...usersProviders,
    ...blogsProviders,
    ...postsProviders,
    ...testingProviders,
    LoginIsExistConstraint,
    EmailIsExistConstraint,
    ...basicProviders,
    ...strategyProviders,
    // {
    //   provide: AppSettings,
    //   useValue: appSettings,
    // },
    /* {
        provide: UsersService,
        useClass: UsersService,
    },*/
    /*{
        provide: UsersService,
        useValue: {method: () => {}},
    },*/
    // Регистрация с помощью useFactory (необходимы зависимости из ioc, подбор провайдера, ...)
    // {
    //   provide: UsersService,
    //   useFactory: (repo: UsersRepository, authService: AuthService) => {
    //     return new UsersService(repo, authService);
    //   },
    //   inject: [UsersRepository, AuthService]
    // }
  ],
})
export class AppModule {}
