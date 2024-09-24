// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { PostsMongoRepository } from '../../../posts/infrastructure/posts.repository';
// import { UsersRepository } from '../../../../users/infrastructure/users.repository';
// import { PostDocument } from '../../../posts/domain/post.entity';
// import { Result } from '../../../../../base/types/object-result';
// import { UserDocument } from '../../../../users/domain/user.entity';
// import { InjectModel } from '@nestjs/mongoose';
// import {
//   Comment,
//   CommentDocument,
//   CommentModelType,
// } from '../../domain/comments.entity';
// import { CommentsRepository } from '../../infrastructure/comments.repository';
//
// export class CreateCommentCommand {
//   constructor(
//     public readonly postId: string,
//     public readonly content: string,
//     public readonly userId: string,
//   ) {}
// }
//
// @CommandHandler(CreateCommentCommand)
// export class CreateCommentUseCase
//   implements ICommandHandler<CreateCommentCommand>
// {
//   constructor(
//     private readonly postsRepository: PostsMongoRepository,
//     private readonly usersRepository: UsersRepository,
//     private readonly commentsRepository: CommentsRepository,
//     @InjectModel(Comment.name) private readonly commentModel: CommentModelType,
//   ) {}
//
//   async execute(command: CreateCommentCommand) {
//     const { postId, content, userId } = command;
//
//     const post: PostDocument | null =
//       await this.postsRepository.findById(postId);
//
//     if (!post) {
//       return Result.notFound(`Post with postId doesn't exist`);
//     }
//
//     const user: UserDocument | null =
//       await this.usersRepository.findById(userId);
//     const userLogin: string = user!.login;
//     if (!user) {
//       return Result.unauthorized("User doesn't exist");
//     }
//
//     const newComment: CommentDocument = new this.commentModel({
//       postId: postId,
//       content: content,
//       commentatorInfo: {
//         userId: userId,
//         userLogin: userLogin,
//       },
//       likes: [],
//       likesCount: 0,
//       dislikesCount: 0,
//       createdAt: new Date(),
//     });
//
//     const createdComment: CommentDocument =
//       await this.commentsRepository.save(newComment);
//
//     return Result.success(createdComment.id);
//   }
// }
