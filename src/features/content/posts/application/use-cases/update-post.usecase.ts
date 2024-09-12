import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../domain/post.entity';
import { Result } from '../../../../../base/types/object-result';
import mongoose from 'mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly shortDescription: string,
    public readonly content: string,
    public readonly blogId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand) {
    const post: PostDocument | null = await this.postsRepository.findById(
      command.id,
    );
    if (!post) {
      return Result.notFound(`Post with id ${command.id} not found`);
    }

    post.title = command.title;
    post.shortDescription = command.shortDescription;
    post.content = command.content;
    post.blogId = new mongoose.Types.ObjectId(command.blogId);

    await this.postsRepository.save(post);

    return Result.success();
  }
}
