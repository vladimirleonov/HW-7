import { Injectable } from '@nestjs/common';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/user.entity';
import { EmailConfirmation } from '../../domain/email-confirmation';
import { PasswordRecovery } from '../../domain/password-recovery';

@Injectable()
export class UsersTypeormRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepository: Repository<EmailConfirmation>,
    @InjectRepository(PasswordRecovery)
    private readonly passwordRecoveryRepository: Repository<PasswordRecovery>,
  ) {}

  async findByField(field: string, value: string): Promise<User | null> {
    // User | null
    return this.usersRepository.findOneBy({
      [field]: value,
    });
  }

  async findById(id: number): Promise<User | null> {
    // User | null
    return await this.usersRepository.findOne({
      where: { id: id },
      relations: ['emailConfirmation', 'passwordRecovery'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    // User | null
    return this.usersRepository.findOne({
      where: { email },
      relations: ['emailConfirmation', 'passwordRecovery'],
    });
  }

  async findByLogin(login: string): Promise<User | null> {
    // User | null
    return this.usersRepository.findOneBy({ login });
  }

  async findByLoginOrEmailField(loginOrEmail: string): Promise<User | null> {
    // User | null
    return this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async findUserByConfirmationCode(
    confirmationCode: string,
  ): Promise<User | null> {
    // User | null
    return this.usersRepository.findOne({
      where: {
        emailConfirmation: { confirmationCode },
      },
      relations: ['emailConfirmation'],
    });
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<User | null> {
    // User | null
    return this.usersRepository.findOne({
      where: {
        passwordRecovery: { recoveryCode },
      },
      relations: ['passwordRecovery'],
    });
  }

  async create(
    login: string,
    passwordHash: string,
    email: string,
    emailConfirmationData: {
      confirmationCode: string;
      expirationDate: Date;
      isConfirmed: boolean;
    },
    passwordRecoveryData: {
      recoveryCode: string;
      expirationDate: Date;
    },
  ): Promise<User> {
    return this.dataSource.manager.transaction(async (manager) => {
      // Create user entity
      const newUser = manager.create(User, {
        login: login,
        password: passwordHash,
        email: email,
        createdAt: new Date(),
      });

      const createdUser: User = await manager.save(newUser);

      // Create email confirmation entity
      const emailConfirmation: EmailConfirmation = manager.create(
        EmailConfirmation,
        {
          user: createdUser,
          confirmationCode: emailConfirmationData.confirmationCode,
          expirationDate: emailConfirmationData.expirationDate,
          isConfirmed: emailConfirmationData.isConfirmed,
        },
      );

      await manager.save(emailConfirmation);

      // Create password recovery
      const passwordRecovery: PasswordRecovery = manager.create(
        PasswordRecovery,
        {
          user: createdUser,
          recoveryCode: passwordRecoveryData.recoveryCode,
          expirationDate: passwordRecoveryData.expirationDate,
        },
      );
      await manager.save(passwordRecovery);

      return createdUser;
    });
  }

  async updatePasswordRecoveryData(
    recoveryCode: string,
    expirationDate: Date,
    userId: number,
  ): Promise<boolean> {
    const result: UpdateResult = await this.passwordRecoveryRepository.update(
      userId,
      {
        recoveryCode,
        expirationDate,
      },
    );

    return result.affected === 1;
  }

  async updateEmailConfirmationData(
    confirmationCode: string,
    expirationDate: Date,
    userId: number,
  ): Promise<boolean> {
    const result: UpdateResult = await this.emailConfirmationRepository.update(
      userId,
      {
        confirmationCode,
        expirationDate,
      },
    );

    return result.affected === 1;
  }

  async updateUserPasswordHashRecoveryCodeAndExpirationDate(
    passwordHash: string,
    recoveryCode: string,
    expirationDate: Date,
    userId: number,
  ): Promise<boolean> {
    const userUpdateResult: UpdateResult = await this.usersRepository.update(
      userId,
      {
        password: passwordHash,
      },
    );

    const passwordRecoveryUpdateResult: UpdateResult =
      await this.passwordRecoveryRepository.update(userId, {
        recoveryCode,
        expirationDate,
      });

    return (
      userUpdateResult.affected === 1 &&
      passwordRecoveryUpdateResult.affected === 1
    );
  }

  async updateIsConfirmed(
    isConfirmed: boolean,
    userId: number,
  ): Promise<boolean> {
    const result: UpdateResult = await this.emailConfirmationRepository.update(
      userId,
      { isConfirmed },
    );

    return result.affected === 1;
  }
}
