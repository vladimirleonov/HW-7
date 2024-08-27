import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { Model } from 'mongoose';
import { UsersRepository } from '../infrastructure/users.repository';
import { Result } from '../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { AppSettings } from '../../../settings/app-settings';
import { CryptoService } from '../../../core/application/crypto.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private appSettings: AppSettings,
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

    if (foundUserByLogin || foundUserByEmail) {
      return Result.badRequest('User already exists');
    }

    const generatedPasswordHash: string = await this.cryptoService.createHash(
      password,
      this.appSettings.api.HASH_ROUNDS,
    );

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

    return Result.success(createdUser.id);
  }

  async delete(id: string): Promise<Result> {
    const isDeleted: boolean = await this.usersRepository.delete(id);

    if (isDeleted) {
      return Result.success();
    } else {
      return Result.notFound(`User with id ${id} does not exist`);
    }
  }
}
