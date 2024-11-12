import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
  execute(command: CreateQuestionCommand): any {
    const { body, correctAnswers } = command;
    console.log('body', body);
    console.log('correctAnswers', correctAnswers);
  }
}
