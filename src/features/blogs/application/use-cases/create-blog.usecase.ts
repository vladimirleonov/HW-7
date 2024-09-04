import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog, BlogDocument } from '../../domain/blog.entity';
import { Result } from '../../../../base/types/object-result';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly websiteUrl: string,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
  ) {}

  async execute(command: CreateBlogCommand) {
    const newBlog: BlogDocument = new this.blogModel({
      name: command.name,
      description: command.description,
      websiteUrl: command.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    });

    const createdBlog: BlogDocument = await this.blogsRepository.save(newBlog);

    return Result.success(createdBlog.id);
  }
}
