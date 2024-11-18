import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsTypeormRepository } from '../../infrastructure/questions-typeorm.repository';
import { Question } from '../../domain/question.entity';
import { Result } from '../../../../base/types/object-result';

export class UpdatePublishedStatusCommand {
  constructor(
    public readonly id: number,
    public readonly published: boolean,
  ) {}
}

@CommandHandler(UpdatePublishedStatusCommand)
export class UpdatePublishedStatusUseCase
  implements ICommandHandler<UpdatePublishedStatusCommand>
{
  constructor(
    private readonly questionsTypeormRepository: QuestionsTypeormRepository,
  ) {}

  async execute(command: UpdatePublishedStatusCommand) {
    const { id, published } = command;

    const question: Question | null =
      await this.questionsTypeormRepository.getOne(id);

    if (!question) {
      return Result.notFound();
    }

    question.published = published;

    await this.questionsTypeormRepository.save(question);

    return Result.success();
  }
}
