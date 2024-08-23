import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }
  async findByField(
    field: string,
    value: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({ [field]: value });
  }
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email: email });
  }
  async findByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ login: login });
  }
  async findUserByLoginOrEmailField(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }
  async delete(id: string): Promise<boolean> {
    const deletedInfo = await this.UserModel.deleteOne({ _id: id });
    return deletedInfo.deletedCount === 1;
  }
}
