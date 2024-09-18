import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersPostgresqlRepository {
  constructor() {}
  // async save(user: UserDocument): Promise<> {}
  //
  async findById(id: string) {}

  async findByField(field: string, value: string): Promise<any> {
    //return this.UserModel.findOne({ [field]: value });
  }

  // async findUserByConfirmationCode(confirmationCode: string): Promise<> {}
  //
  // async findUserByRecoveryCode(recoveryCode: string): Promise<> {}
  //
  // async findByEmail(email: string): Promise<> {}
  //
  // async findByLogin(login: string): Promise<> {}
  //
  async findByLoginOrEmailField(loginOrEmail: string) {}
  //
  // async delete(id: string): Promise<> {}
}
