import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './features/users/api/users.controller';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { UsersQueryRepository } from './features/users/infrastructure/users.query-repository';
import { User, UserSchema } from './features/users/domain/user.entity';
import { AuthService } from './features/auth/application/auth.service';
import { BlogsController } from './features/blogs/api/blogs.controller';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository';
import { Blog, BlogSchema } from './features/blogs/domain/blog.entity';
import { Post, PostSchema } from './features/posts/domain/post.entity';
import { PostsController } from './features/posts/api/posts.controller';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query-repository';
import { TestingService } from './features/testing/application/testing.service';
import { TestingRepository } from './features/testing/infrastructure/testing.repository';
import { TestingController } from './features/testing/api/testing.controller';
import { Device, DeviceSchema } from './features/security/domain/device.entity';
import { DevicesRepository } from './features/security/infrastructure/device.repository';
import { AuthController } from './features/auth/api/auth.controller';
import { SecurityService } from './features/security/application/security.service';
import { ApiAccessLogsRepository } from './features/auth/infrastructure/api-access-logs.repository';
import {
  ApiAccessLog,
  ApiAccessLogSchema,
} from './features/auth/domain/api-access-log.entity';
import { UtilsService } from './core/application/utils.service';
import { CryptoService } from './core/application/crypto.service';
import { NodemailerService } from './core/application/nodemailer.service';
import { LoginIsExistConstraint } from './core/decorators/validate/login-is-exist.decorator';
import { EmailIsExistConstraint } from './core/decorators/validate/email-is-exist.decorator';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ConfigurationType } from './settings/env/configuration';
import { LocalStrategy } from './core/stratagies/local.strategy';
import { JwtStrategy } from './core/stratagies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { BasicStrategy } from './core/stratagies/basic.strategy';
import { RefreshTokenJwtStrategy } from './core/stratagies/refresh-token-jwt.strategy';
import { EnvironmentSettings } from './settings/env/env-settings';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './features/users/application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from './features/users/application/use-cases/delete-user.usecase';
import { CreatePostUseCase } from './features/posts/application/use-cases/create-post.usecase';
import { UpdatePostUseCase } from './features/posts/application/use-cases/update-post.usecase';
import { DeletePostUseCase } from './features/posts/application/use-cases/delete-post.usecase';
import { CreateBlogUseCase } from './features/blogs/application/use-cases/create-blog.usecase';
import { UpdateBlogUseCase } from './features/blogs/application/use-cases/update-blog.usecase';
import { DeleteBlogUseCase } from './features/blogs/application/use-cases/delete-blog.usecase';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query-repository';
import {
  Comment,
  CommentSchema,
} from './features/comments/domain/comments.entity';
import { BlogIsExistConstraint } from './core/decorators/validate/blog-is-exist.decorator';
import { LoginUseCase } from './features/auth/application/use-cases/login.usecase';
import { RegistrationUseCase } from './features/auth/application/use-cases/registration-user.usecase';
import { ConfirmRegistrationUseCase } from './features/auth/application/use-cases/confirm-registration.usecase';
import { RegistrationEmailResendingUseCase } from './features/auth/application/use-cases/registration-email-resending.usecase';
import { PasswordRecoveryUseCase } from './features/auth/application/use-cases/password-recovery.usecase';
import { SetNewPasswordUseCase } from './features/auth/application/use-cases/set-new-password.usecase';
import { LogoutUseCase } from './features/auth/application/use-cases/logout';
import { UpdatePostLikeStatusUseCase } from './features/posts/application/use-cases/update-post-like-status.usecase';
import { OptionalJwtStrategy } from './core/stratagies/optional-jwt.strategy';
import { CreateCommentUseCase } from './features/comments/application/use-cases/create-comment.usecase';
import { DeleteCommentUseCase } from './features/comments/application/use-cases/delete-comment.usecase';
import { UpdateCommentUseCase } from './features/comments/application/use-cases/update-comment.usecase';
import { UpdateCommentLikeStatusUseCase } from './features/comments/application/use-cases/update-comment-like-status.usecase';
import { CommentsRepository } from './features/comments/infrastructure/comments.repository';
import { Like, LikeSchema } from './features/like/domain/like.entity';
import { ApiSettings } from './settings/env/api-settings';
import { CommentsController } from './features/comments/api/comments.controller';
import { SecurityController } from './features/security/api/security.controller';
import { DeviceQueryRepository } from './features/security/infrastructure/device.query-repository';
import { TerminateAllOtherUserDevicesUseCase } from './features/security/application/use-cases/terminate-all-other-user-devices.usecase';
import { TerminateUserDeviceUseCase } from './features/security/application/use-cases/terminate-user-device.usecase';
import { ClearCookieInterceptor } from './core/interceptors/clear-cookie.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  RefreshTokenCommand,
  RefreshTokenUseCase,
} from './features/auth/application/use-cases/refresh-token.usecase';
import { ThrottlerModule } from '@nestjs/throttler';

const strategyProviders: Provider[] = [
  LocalStrategy,
  JwtStrategy,
  BasicStrategy,
  RefreshTokenJwtStrategy,
  OptionalJwtStrategy,
];

const basicProviders: Provider[] = [
  UtilsService,
  // JwtService,
  CryptoService,
  NodemailerService,
];

const constraintProviders: Provider[] = [
  BlogIsExistConstraint,
  LoginIsExistConstraint,
  EmailIsExistConstraint,
];

const authProviders: Provider[] = [
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUseCase,
  SetNewPasswordUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  AuthService,
  ApiAccessLogsRepository,
];

const securityProviders: Provider[] = [
  TerminateAllOtherUserDevicesUseCase,
  TerminateUserDeviceUseCase,
  SecurityService,
  DevicesRepository,
  DeviceQueryRepository,
];

const usersProviders: Provider[] = [
  CreateUserUseCase,
  DeleteUserUseCase,
  // UsersService,
  UsersRepository,
  UsersQueryRepository,
];

const blogsProviders: Provider[] = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  // BlogsService,
  BlogsRepository,
  BlogsQueryRepository,
];

const postsProviders: Provider[] = [
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  UpdatePostLikeStatusUseCase,
  // PostsService,
  PostsRepository,
  PostsQueryRepository,
];

const commentsProviders: Provider[] = [
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  CommentsRepository,
  CommentsQueryRepository,
];

const testingProviders: Provider[] = [TestingService, TestingRepository];

@Module({
  imports: [
    // Сначала глобальные модули для конфигурации
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      // validate: validate,
      // ignoreEnvFile:
      //   process.env.ENV !== Environments.DEVELOPMENT &&
      //   process.env.ENV !== Environments.TESTING,arn run start:dev
      envFilePath: ['.env.development', '.env'],
    }),
    // JwtModule.register({
    //   secret: appSettings.api.JWT_SECRET,
    //   signOptions: { expiresIn: appSettings.api.JWT_EXPIRATION_TIME },
    // }),
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
    // MongooseModule.forRoot(
    //   appSettings.env.isTesting()
    //     ? appSettings.api.MONGO_CONNECTION_URI_FOR_TESTS
    //     : appSettings.api.MONGO_CONNECTION_URI,
    // ),
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

        // console.log(uri);

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
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
    CqrsModule,
  ],
  controllers: [
    AuthController,
    SecurityController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    TestingController,
  ],
  providers: [
    ...authProviders,
    ...securityProviders,
    ...usersProviders,
    ...blogsProviders,
    ...postsProviders,
    ...commentsProviders,
    ...testingProviders,
    ...constraintProviders,
    ...basicProviders,
    ...strategyProviders,
    // {!!!!!!!!!!!!!!!! not use - clear before all requests
    //   provide: APP_INTERCEPTOR,
    //   useClass: ClearCookieInterceptor,
    // },
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
