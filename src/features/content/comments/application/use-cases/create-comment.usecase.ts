import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../base/types/object-result';
import { PostsTypeormRepository } from '../../../posts/infrastructure/typeorm/posts-typeorm.repository';
import { UsersTypeormRepository } from '../../../../users/infrastructure/typeorm/users-typeorm.repository';
import { CommentsTypeormRepository } from '../../infrastructure/typeorm/comments-typeorm.repository';
import { Comment } from '../../domain/comments.entity';
import { User } from '../../../../users/domain/user.entity';

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
    private readonly postsTypeormRepository: PostsTypeormRepository,
    private readonly usersTypeormRepository: UsersTypeormRepository,
    private readonly commentsPostgresRepository: CommentsTypeormRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const { postId, content, userId } = command;

    const post = await this.postsTypeormRepository.findById(postId);

    if (!post) {
      return Result.notFound(`Post with postId doesn't exist`);
    }

    const user: User | null =
      await this.usersTypeormRepository.findById(userId);

    if (!user) {
      return Result.unauthorized("User doesn't exist");
    }

    const comment: Comment = Comment.create(post, user, content);

    await this.commentsPostgresRepository.save(comment);

    const commentId: number = comment.id;

    // const commentId = await this.commentsPostgresRepository.create(
    //   postId,
    //   content,
    //   userId,
    // );

    return Result.success(commentId);
  }
}
