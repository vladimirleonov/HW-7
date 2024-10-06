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
import { BlogsSAController } from './blogs/api/blogs-sa.controller';
import { UpdateBlogPostUseCase } from './blogs/application/use-cases/update-blog-post.usecase';
import { DeleteBlogPostUseCase } from './blogs/application/use-cases/delete-blog-post.usecase';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment.usecase';
import { CommentsPostgresRepository } from './comments/infrastructure/postgres/comments-postgres.repository';
import { CommentsPostgresQueryRepository } from './comments/infrastructure/postgres/comments-postgres.query-repository';
import { PostLikesPostgresRepository } from './posts/infrastructure/postgres/post-likes-postgres.repository';
import { CommentsController } from './comments/api/comments.controller';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment.usecase';
import { UpdateCommentLikeStatusUseCase } from './comments/application/use-cases/update-comment-like-status.usecase';
import { CommentLikesPostgresRepository } from './comments/infrastructure/postgres/comment-likes-postgres.repository';

const blogsProviders: Provider[] = [
  // use cases
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogPostUseCase,
  DeleteBlogPostUseCase,

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
  PostLikesPostgresRepository,
];

const commentsProviders: Provider[] = [
  // use cases
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,

  // repositories
  CommentsPostgresRepository,
  CommentsPostgresQueryRepository,
  CommentLikesPostgresRepository,
];

@Module({
  imports: [CqrsModule, AuthModule, UsersModule],
  controllers: [
    BlogsController,
    PostsController,
    BlogsSAController,
    CommentsController,
  ],
  providers: [...blogsProviders, ...postsProviders, ...commentsProviders],
  exports: [BlogsPostgresRepository], // Expose ContentService for other modules to use
})
export class ContentModule {}
