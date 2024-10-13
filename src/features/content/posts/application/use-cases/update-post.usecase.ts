// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { PostsPostgresRepository } from '../../infrastructure/postgres/posts-postgres.repository';
//
// export class UpdatePostCommand {
//   constructor(
//     public readonly id: string,
//     public readonly title: string,
//     public readonly shortDescription: string,
//     public readonly content: string,
//     public readonly blogId: string,
//   ) {}
// }
//
// @CommandHandler(UpdatePostCommand)
// export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
//   constructor(
//     private readonly postsPostgresRepository: PostsPostgresRepository,
//   ) {}
//
//   async execute(command: UpdatePostCommand) {
//     const post: PostDocument | null = await this.postsRepository.findById(
//       command.id,
//     );
//     if (!post) {
//       return Result.notFound(`Post with id ${command.id} not found`);
//     }
//
//     post.title = command.title;
//     post.shortDescription = command.shortDescription;
//     post.content = command.content;
//     post.blogId = new mongoose.Types.ObjectId(command.blogId);
//
//     await this.postsRepository.save(post);
//
//     return Result.success();
//   }
// }
