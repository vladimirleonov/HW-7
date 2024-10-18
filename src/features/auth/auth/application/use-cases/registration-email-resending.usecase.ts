import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultStatus } from '../../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { registrationEmailTemplate } from '../../../../../core/email-templates/registration-email-template';
import { UsersTypeormRepository } from '../../../../users/infrastructure/typeorm/users-typeorm.repository';
import { NodemailerService } from '../../../../../core/application/nodemailer.service';

export class RegistrationEmailResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler {
  constructor(
    private readonly usersTypeormRepository: UsersTypeormRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(command: RegistrationEmailResendingCommand): Promise<any> {
    const { email } = command;

    const existingUser = await this.usersTypeormRepository.findByEmail(email);

    if (!existingUser) {
      // return Result.badRequest('Invalid email provided');
      return Result.badRequest([
        {
          message: `User with email ${email} does not exist`,
          field: 'email',
        },
      ]);
    }

    // hw-9 error in test -> comment this code
    if (existingUser.emailConfirmation.isConfirmed) {
      return Result.badRequest([
        {
          message: 'Email already confirmed',
          field: 'email',
        },
      ]);
    }

    const confirmationCode: string = randomUUID();
    const expirationDate: Date = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    const userId: number = existingUser.id;

    await this.usersTypeormRepository.updateEmailConfirmationData(
      confirmationCode,
      expirationDate,
      userId,
    );

    this.nodemailerService.sendEmail(
      email,
      registrationEmailTemplate(confirmationCode),
      'Registration Confirmation',
    );

    return {
      status: ResultStatus.Success,
      data: null,
    };
  }
}
