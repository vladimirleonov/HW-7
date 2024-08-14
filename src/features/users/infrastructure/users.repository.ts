import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async save(user: UserDocument): Promise<UserDocument> {
    return user.save()
  }
  async findUserByField(field: string, value: string): Promise<UserDocument | null> {
    return this.userModel.findOne({[field]: value})
  }
}