import { ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionsTypeormRepository } from '../../infrastructure/questions-typeorm.repository';
import { Result } from '../../../../base/types/object-result';
import { Question } from '../../domain/question.entity';

export class UpdateQuestionCommand {
  constructor(
    public readonly id: number,
    public readonly body: string,
    public readonly correctAnswers: string[],
  ) {}
}

@QueryHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(
    public readonly questionsTypeormRepository: QuestionsTypeormRepository,
  ) {}

  async execute(command: UpdateQuestionCommand): Promise<Result> {
    const { id, body, correctAnswers } = command;

    const question: Question | null =
      await this.questionsTypeormRepository.findOne(id);

    if (!question) {
      return Result.notFound();
    }

    question.body = body;
    question.correctAnswers = correctAnswers;

    await this.questionsTypeormRepository.save(question);

    return Result.success();
  }
}
