// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { User, UserDocument, UserModelType } from '../../domain/user.entity';
//
// @Injectable()
// export class UsersMongoRepository {
//   constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
//   async save(user: UserDocument): Promise<UserDocument> {
//     return user.save();
//   }
//
//   async findById(id: string): Promise<UserDocument | null> {
//     return this.UserModel.findOne({ _id: id });
//   }
//
//   async findByField(
//     field: string,
//     value: string,
//   ): Promise<UserDocument | null> {
//     return this.UserModel.findOne({ [field]: value });
//   }
//
//   async findUserByConfirmationCode(
//     confirmationCode: string,
//   ): Promise<UserDocument | null> {
//     return this.UserModel.findOne({
//       ['emailConfirmation.confirmationCode']: confirmationCode,
//     });
//   }
//
//   async findUserByRecoveryCode(
//     recoveryCode: string,
//   ): Promise<UserDocument | null> {
//     return this.UserModel.findOne({
//       ['passwordRecovery.recoveryCode']: recoveryCode,
//     });
//   }
//
//   async findByEmail(email: string): Promise<UserDocument | null> {
//     return this.UserModel.findOne({ email: email });
//   }
//
//   async findByLogin(login: string): Promise<UserDocument | null> {
//     return this.UserModel.findOne({ login: login });
//   }
//
//   async findByLoginOrEmailField(
//     loginOrEmail: string,
//   ): Promise<UserDocument | null> {
//     return this.UserModel.findOne({
//       $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
//     });
//   }
//
//   async delete(id: string): Promise<boolean> {
//     const deletedInfo = await this.UserModel.deleteOne({ _id: id });
//     return deletedInfo.deletedCount === 1;
//   }
// }
