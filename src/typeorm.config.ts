import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './features/users/domain/user.entity';
import { EmailConfirmation } from './features/users/domain/email-confirmation';
import { PasswordRecovery } from './features/users/domain/password-recovery';
import { Device } from './features/auth/security/domain/device.entity';
import { Blog } from './features/content/blogs/domain/blog.entity';
import { Post } from './features/content/posts/domain/post.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Comment } from './features/content/comments/domain/comment.entity';
import {
  CommentLike,
  PostLike,
} from './features/content/like/domain/like.entity';

config({ path: ['.env.development', '.env'] });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  migrations: ['src/migrations/*.ts'],
  // migrations: [__dirname + '/migrations/**/*{.ts, .js}'],
  entities: [
    User,
    EmailConfirmation,
    PasswordRecovery,
    Device,
    Blog,
    Post,
    Comment,
    CommentLike,
    PostLike,
  ],
  synchronize: false,
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
});

// import { ConfigService } from '@nestjs/config';
// import configuration, {
//   ConfigurationType,
//   EnvironmentVariable,
// } from './settings/env/configuration';
// import { DatabaseSettings } from './settings/env/database-settings';
// import { User } from './features/users/domain/user.entity';
// import { EmailConfirmation } from './features/users/domain/email-confirmation';
// import { PasswordRecovery } from './features/users/domain/password-recovery';
// import { Device } from './features/auth/security/domain/device.entity';
// import { Blog } from './features/content/blogs/domain/blog.entity';
// import { Post } from './features/content/posts/domain/post.entity';
// import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
// import { DataSource, DataSourceOptions } from 'typeorm';
//
// const createDataSourceOptions = (
//   configService: ConfigService<ConfigurationType, true>,
// ): DataSourceOptions => {
//   const databaseSettings: DatabaseSettings =
//     configService.get<DatabaseSettings>('databaseSettings');
//
//   console.log('Database settings:', databaseSettings);
//
//   return {
//     type: databaseSettings.DB_TYPE as 'postgres',
//     host: databaseSettings.DB_HOST,
//     port: databaseSettings.DB_PORT,
//     username: databaseSettings.DB_USERNAME,
//     password: databaseSettings.DB_PASSWORD,
//     database: databaseSettings.DB_DATABASE,
//     entities: [User, EmailConfirmation, PasswordRecovery, Device, Blog, Post],
//     migrations: ['src/migrations/*.ts'],
//     synchronize: false,
//     logging: true,
//     namingStrategy: new SnakeNamingStrategy(),
//   };
// };
//
// const configService = new ConfigService<ConfigurationType>(configuration());
//
// export default new DataSource(createDataSourceOptions(configService));
