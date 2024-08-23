import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { Model } from 'mongoose';
import { UsersRepository } from '../infrastructure/users.repository';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { AuthService } from '../../auth/application/auth.service';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersRepository: UsersRepository,
    private authService: AuthService,
  ) {}

  async create(
    login: string,
    password: string,
    email: string,
  ): Promise<Result<string | null>> {
    const [foundUserByLogin, foundUserByEmail]: [User | null, User | null] =
      await Promise.all([
        this.usersRepository.findByField('login', login),
        this.usersRepository.findByField('email', email),
      ]);

    if (foundUserByLogin) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{ field: 'login', message: 'User already exists' }],
        data: null,
      };
    }

    if (foundUserByEmail) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{ field: 'email', message: 'User already exists' }],
        data: null,
      };
    }

    const generatedPasswordHash: string =
      await this.authService.generatePasswordHash(password);

    // ??? how to create user correctly
    const newUser: UserDocument = new this.userModel({
      login: login,
      password: generatedPasswordHash,
      email: email,
      createdAt: new Date(),
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: new Date(),
        isConfirmed: true,
      },
      passwordRecovery: {
        recoveryCode: '',
        expirationDate: new Date(),
      },
    });

    const createdUser: UserDocument = await this.usersRepository.save(newUser);

    return {
      status: ResultStatus.Success,
      data: createdUser.id,
    };
  }
  async delete(id: string): Promise<Result<boolean>> {
    const isDeleted: boolean = await this.usersRepository.delete(id);
    if (isDeleted) {
      return {
        status: ResultStatus.Success,
        data: true,
      };
    } else {
      return {
        status: ResultStatus.NotFound,
        extensions: [
          { field: 'id', message: `User with id ${id} does not exist` },
        ],
        data: false,
      };
    }
  }
}
