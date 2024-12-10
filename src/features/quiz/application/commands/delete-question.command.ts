import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsTypeormRepository } from '../../infrastructure/question/questions-typeorm.repository';
import { Result } from '../../../../base/types/object-result';

export class DeleteQuestionCommand {
  constructor(public readonly id: number) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(
    private readonly questionsTypeormRepository: QuestionsTypeormRepository,
  ) {}

  async execute(command: DeleteQuestionCommand): Promise<Result> {
    const { id } = command;

    const isDeleted: boolean = await this.questionsTypeormRepository.delete(id);

    if (!isDeleted) {
      return Result.notFound();
    }

    return Result.success();
  }
}
