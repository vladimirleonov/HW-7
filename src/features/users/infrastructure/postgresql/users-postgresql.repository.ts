import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersPostgresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  // async save(user: UserDocument): Promise<> {}
  //
  async findById(id: string) {}

  async findByField(field: string, value: string): Promise<any> {
    const query: string = `SELECT * FROM "Users" WHERE "${field}" = $1`;
    const result = await this.dataSource.query(query, [value]);
    return result;
  }

  async create() {}

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
