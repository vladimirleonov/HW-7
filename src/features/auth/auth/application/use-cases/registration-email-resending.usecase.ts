import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../../../users/domain/user.entity';
import { Result, ResultStatus } from '../../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { registrationEmailTemplate } from '../../../../../core/email-templates/registration-email-template';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { NodemailerService } from '../../../../../core/application/nodemailer.service';

export class RegistrationEmailResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(command: RegistrationEmailResendingCommand): Promise<any> {
    const { email } = command;

    const existingUser: UserDocument | null =
      await this.userRepository.findByEmail(email);

    if (!existingUser) {
      return Result.badRequest('Invalid email provided');
    }

    // hw-9 error in test -> comment this code
    if (existingUser.emailConfirmation.isConfirmed) {
      return Result.badRequest('Email already confirmed');
    }

    const confirmationCode: string = randomUUID();
    const expirationDate: Date = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    existingUser.emailConfirmation.confirmationCode = confirmationCode;
    existingUser.emailConfirmation.expirationDate = expirationDate;

    await this.userRepository.save(existingUser);

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
