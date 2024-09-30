import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { InjectModel } from '@nestjs/mongoose';
import { PostsPostgresRepository } from '../../../posts/infrastructure/postgres/posts-postgres.repository';
import { UsersPostgresRepository } from '../../../../users/infrastructure/postgresql/users-postgres.repository';
import { CommentsPostgresRepository } from '../../infrastructure/postgres/comments.repository';

export class CreateCommentCommand {
  constructor(
    public readonly postId: number,
    public readonly content: string,
    public readonly userId: number,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private readonly postsPostgresRepository: PostsPostgresRepository,
    private readonly usersPostgresRepository: UsersPostgresRepository,
    private readonly commentsPostgresRepository: CommentsPostgresRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const { postId, content, userId } = command;

    const post = await this.postsPostgresRepository.findById(postId);

    if (!post) {
      return Result.notFound(`Post with postId doesn't exist`);
    }

    const user = await this.usersPostgresRepository.findById(userId);

    const userLogin: string = user!.login;

    if (!user) {
      return Result.unauthorized("User doesn't exist");
    }

    const commentId = await this.commentsPostgresRepository.create(
      postId,
      content,
      userId,
    );

    return Result.success(commentId);

    // const newComment: CommentDocument = new this.commentModel({
    //   postId: postId,
    //   content: content,
    //   commentatorInfo: {
    //     userId: userId,
    //     userLogin: userLogin,
    //   },
    //   likes: [],
    //   likesCount: 0,
    //   dislikesCount: 0,
    //   createdAt: new Date(),
    // });
    //
    // const createdComment: CommentDocument =
    //   await this.commentsRepository.save(newComment);

    // return Result.success(createdComment.id);
  }
}
