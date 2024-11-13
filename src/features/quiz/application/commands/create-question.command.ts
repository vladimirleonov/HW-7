import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from '../../domain/question.entity';
import { QuestionsTypeormRepository } from '../../infrastructure/questions-typeorm.repository';
import { Result } from '../../../../base/types/object-result';

export class CreateQuestionCommand {
  constructor(
    public readonly body: string,
    public readonly correctAnswers: string[],
  ) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(
    public readonly questionsTypeormRepository: QuestionsTypeormRepository,
  ) {}

  async execute(command: CreateQuestionCommand): Promise<Result<number>> {
    const { body, correctAnswers } = command;

    const question: Question = Question.create(body, correctAnswers);

    await this.questionsTypeormRepository.save(question);

    return Result.success(question.id);
  }
}
