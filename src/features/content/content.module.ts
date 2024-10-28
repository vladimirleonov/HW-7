import { Module, Provider } from '@nestjs/common';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.usecase';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.usecase';
// import { UpdatePostUseCase } from './posts/application/use-cases/update-post.usecase';
// import { DeletePostUseCase } from './posts/application/use-cases/delete-post.usecase';
import { UpdatePostLikeStatusUseCase } from './posts/application/use-cases/update-post-like-status.usecase';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { UsersModule } from '../users/users.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { BlogIsExistConstraint } from '../../core/decorators/validators/blog-is-exist.decorator';
import { BlogsTypeormRepository } from './blogs/infrastructure/typeorm/blogs-typeorm.repository';
import { BlogsTypeormQueryRepository } from './blogs/infrastructure/typeorm/blogs-typeorm.query-repository';
import { PostsTypeormRepository } from './posts/infrastructure/typeorm/posts-typeorm.repository';
import { PostsTypeormQueryRepository } from './posts/infrastructure/typeorm/posts-typeorm.query-repository';
import { BlogsSAController } from './blogs/api/blogs-sa.controller';
import { UpdateBlogPostUseCase } from './posts/application/use-cases/update-blog-post.usecase';
import { DeleteBlogPostUseCase } from './posts/application/use-cases/delete-blog-post.usecase';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment.usecase';
import { CommentsTypeormRepository } from './comments/infrastructure/typeorm/comments-typeorm.repository';
import { CommentsTypeormQueryRepository } from './comments/infrastructure/typeorm/comments-typeorm.query-repository';
import { PostLikesTypeormRepository } from './posts/infrastructure/typeorm/post-likes-typeorm.repository';
import { CommentsController } from './comments/api/comments.controller';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment.usecase';
import { UpdateCommentLikeStatusUseCase } from './comments/application/use-cases/update-comment-like-status.usecase';
import { CommentLikesTypeormRepository } from './comments/infrastructure/typeorm/comment-likes-typeorm.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './posts/domain/post.entity';
import { Blog } from './blogs/domain/blog.entity';
import { GetAllBlogsUseCase } from './blogs/api/queries/get-all-blogs.query';
import { GetBlogUseCase } from './blogs/api/queries/get-blog.query';
import { GetAllBlogPostsUseCase } from './posts/api/queries/get-all-blog-posts.query';
import { GetAllPostsUseCase } from './posts/api/queries/get-all-posts.query';
import { Comment } from './comments/domain/comments.entity';
import { GetCommentUseCase } from './comments/api/queries/get-comment.query';

const blogsProviders: Provider[] = [
  // use cases
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogPostUseCase,
  DeleteBlogPostUseCase,
  //
  GetAllBlogsUseCase,
  GetBlogUseCase,

  // repositories
  // BlogsTypeormRepository,
  // BlogsPostgresQueryRepository,
  BlogsTypeormRepository,
  BlogsTypeormQueryRepository,

  // validation constraint
  BlogIsExistConstraint,
];

const postsProviders: Provider[] = [
  // use cases
  CreatePostUseCase,
  // UpdatePostUseCase,
  // DeletePostUseCase,
  UpdatePostLikeStatusUseCase,
  //
  GetAllPostsUseCase,
  GetAllBlogPostsUseCase,

  // repositories
  // PostsPostgresRepository,
  // PostsPostgresQueryRepository,
  // PostLikesPostgresRepository,
  PostsTypeormRepository,
  PostsTypeormQueryRepository,
  PostLikesTypeormRepository,
];

const commentsProviders: Provider[] = [
  // use cases
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  //
  GetCommentUseCase,

  // repositories
  // CommentsPostgresRepository,
  // CommentsPostgresQueryRepository,
  // CommentLikesPostgresRepository,
  CommentsTypeormRepository,
  CommentsTypeormQueryRepository,
  CommentLikesTypeormRepository,
];

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([Blog, Post, Comment]),
  ],
  controllers: [
    BlogsController,
    PostsController,
    BlogsSAController,
    CommentsController,
  ],
  providers: [...blogsProviders, ...postsProviders, ...commentsProviders],
  exports: [BlogsTypeormRepository], // Expose ContentService for other modules to use
})
export class ContentModule {}
