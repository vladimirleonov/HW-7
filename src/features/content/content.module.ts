import { Module, Provider } from '@nestjs/common';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.usecase';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post.usecase';
import { UpdatePostLikeStatusUseCase } from './posts/application/use-cases/update-post-like-status.usecase';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { UsersModule } from '../users/users.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { BlogIsExistConstraint } from '../../core/decorators/validators/blog-is-exist.decorator';
import { BlogsPostgresRepository } from './blogs/infrastructure/postgres/blogs-postgres.repository';
import { BlogsPostgresQueryRepository } from './blogs/infrastructure/postgres/blogs-postgres.query-repository';
import { PostsPostgresRepository } from './posts/infrastructure/postgres/posts-postgres.repository';
import { PostsPostgresQueryRepository } from './posts/infrastructure/postgres/posts-postgres.query-repository';

const blogsProviders: Provider[] = [
  // use cases
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,

  // repositories
  BlogsPostgresRepository,
  BlogsPostgresQueryRepository,

  // validation constraint
  BlogIsExistConstraint,
];

const postsProviders: Provider[] = [
  // use cases
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  UpdatePostLikeStatusUseCase,

  // repositories
  PostsPostgresRepository,
  PostsPostgresQueryRepository,
];

// const commentsProviders: Provider[] = [
//   // use cases
//   CreateCommentUseCase,
//   DeleteCommentUseCase,
//   UpdateCommentUseCase,
//   UpdateCommentLikeStatusUseCase,
//
//   // repositories
//   CommentsRepository,
//   CommentsQueryRepository,
// ];

@Module({
  imports: [CqrsModule, AuthModule, UsersModule],
  controllers: [
    BlogsController,
    PostsController,
    //CommentsController
  ],
  providers: [
    ...blogsProviders,
    ...postsProviders,
    // ...commentsProviders
  ],
  exports: [BlogsPostgresRepository], // Expose ContentService for other modules to use
})
export class ContentModule {}
