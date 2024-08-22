import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }
  async findByField(
    field: string,
    value: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ [field]: value });
  }
  async findUserByLoginOrEmailField(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }
  async delete(id: string): Promise<boolean> {
    const deletedInfo = await this.userModel.deleteOne({ _id: id });
    return deletedInfo.deletedCount === 1;
  }
}
