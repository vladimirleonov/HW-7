import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './features/users/api/users.controller';
import { UsersService } from './features/users/application/users.service';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { UsersQueryRepository } from './features/users/infrastructure/users.query-repository';
import { User, UserSchema } from './features/users/domain/user.entity';
import { AppSettings, appSettings } from './settings/app-settings';
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
import { JwtService } from './core/application/jwt.service';
import { CryptoService } from './core/application/crypto.service';
import { NodemailerService } from './core/application/nodemailer.service';
import { LoginIsExistConstraint } from './core/decorators/validate/login-is-exist.decorator';
import { EmailIsExistConstraint } from './core/decorators/validate/email-is-exist.decorator';
import { ConfigModule } from '@nestjs/config';
import configuration from './settings/configuration';
import { LocalStrategy } from './core/stratagies/local.strategy';
import { JwtStrategy } from './core/stratagies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { BasicStrategy } from './core/stratagies/basic.strategy';

const authProviders: Provider[] = [AuthService, ApiAccessLogsRepository];

const securityProviders: Provider[] = [SecurityService, DeviceRepository];

const strategyProviders: Provider[] = [
  LocalStrategy,
  JwtStrategy,
  BasicStrategy,
];

const usersProviders: Provider[] = [
  UsersService,
  UsersRepository,
  UsersQueryRepository,
];

const blogsProviders: Provider[] = [
  BlogsService,
  BlogsRepository,
  BlogsQueryRepository,
];

const postsProviders: Provider[] = [
  PostsService,
  PostsRepository,
  PostsQueryRepository,
];

const testingProviders: Provider[] = [TestingService, TestingRepository];

const basicProviders: Provider[] = [
  UtilsService,
  JwtService,
  CryptoService,
  NodemailerService,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    JwtModule.register({
      secret: appSettings.api.JWT_SECRET,
      signOptions: { expiresIn: appSettings.api.JWT_EXPIRATION_TIME },
    }),
    MongooseModule.forRoot(
      appSettings.env.isTesting()
        ? appSettings.api.MONGO_CONNECTION_URI_FOR_TESTS
        : appSettings.api.MONGO_CONNECTION_URI,
    ),
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
    {
      provide: AppSettings,
      useValue: appSettings,
    },
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
