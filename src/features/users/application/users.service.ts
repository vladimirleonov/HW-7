import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {WithId} from "mongodb";
import { User, UserDocument } from '../domain/user.entity';
import { Model } from 'mongoose';
import { UsersRepository } from '../infrastructure/users.repository';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { AuthService } from '../../auth/application/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersRepository: UsersRepository,
    private authService: AuthService
  ) {}

  async create(login: string, password: string, email: string): Promise<Result<string | null>> {
    const [foundUserByLogin, foundUserByEmail]: [WithId<User> | null, WithId<User> | null] = await Promise.all([
      this.usersRepository.findUserByField('login', login),
      this.usersRepository.findUserByField('email', email)
    ])

    if (foundUserByLogin) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{field: 'login', message: 'login should be unique'}],
        data: null
      }
    }

    if (foundUserByEmail) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{field: 'email', message: 'email should be unique'}],
        data: null
      }
    }

    const generatedPasswordHash: string = await this.authService.generatePasswordHash(password);

    // ??? how to create user correctly
    const newUser: UserDocument = new this.userModel({
      login: login,
      password: generatedPasswordHash,
      email: email,
      createdAt: new Date(),
    })

    const createdUser: UserDocument = await this.usersRepository.save(newUser)

    return {
      status: ResultStatus.Success,
      data: createdUser.id.toString(),
    }
  }
}
