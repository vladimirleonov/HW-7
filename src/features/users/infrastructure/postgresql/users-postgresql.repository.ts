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
    const query: string = `SELECT * FROM users WHERE "${field}" = $1`;
    const result = await this.dataSource.query(query, [value]);
    return result.length > 0 ? result[0] : null;
  }

  async create(
    login: string,
    generatedPasswordHash: string,
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
  ): Promise<string | null> {
    /////////////////////////
    // create user and get id
    /////////////////////////
    const userQuery: string = `
      INSERT INTO users(login, password, email) 
      VALUES ($1, $2, $3)
      RETURNING id;
    `;

    const userResult = await this.dataSource.query(userQuery, [
      login,
      generatedPasswordHash,
      email,
    ]);

    const userId: string | null =
      userResult.length > 0 ? userResult[0].id : null;

    //////////////////////////////////////
    // create email_confirmation record
    //////////////////////////////////////

    const emailConfirmationQuery: string = `
      INSERT INTO email_confirmation(user_id, confirmation_code, expiration_date, is_confirmed) 
      VALUES ($1, $2, $3, $4)
    `;

    await this.dataSource.query(emailConfirmationQuery, [
      userId,
      emailConfirmationData.confirmationCode,
      emailConfirmationData.expirationDate,
      emailConfirmationData.isConfirmed,
    ]);

    //////////////////////////////////////
    // create password_recovery record
    //////////////////////////////////////

    const passwordRecoveryQuery: string = `
      INSERT INTO password_recovery(user_id, recovery_code, expiration_date) 
      VALUES ($1, $2, $3)
    `;

    await this.dataSource.query(passwordRecoveryQuery, [
      userId,
      passwordRecoveryData.recoveryCode,
      passwordRecoveryData.expirationDate,
    ]);

    const userWithDetailsQuery: string = `
      SELECT 
        u.id, 
        u.login,
        u.email,
        u.created_at AS "createdAt",
        ec.confirmation_code AS "emailConfirmationConfirmationCode",
        ec.expiration_date AS "emailConfirmationExpirationDate",
        ec.is_confirmed AS "emailConfirmationIsEmailConfirmed",
        pr.recovery_code AS "passwordRecoveryRecoveryCode",
        pr.expiration_date AS "passwordRecoveryExpirationDate"
      FROM users u
      LEFT JOIN email_confirmation ec ON u.id = ec.user_id
      LEFT JOIN password_recovery pr ON u.id = pr.user_id
      WHERE u.id = $1;
    `;

    const userWithDetailsResult = await this.dataSource.query(
      userWithDetailsQuery,
      [userId],
    );

    return userWithDetailsResult.length > 0 ? userWithDetailsResult[0] : null;
  }

  // async findUserByConfirmationCode(confirmationCode: string): Promise<> {}
  //
  // async findUserByRecoveryCode(recoveryCode: string): Promise<> {}
  //
  // async findByEmail(email: string): Promise<> {}
  //
  // async findByLogin(login: string): Promise<> {}
  //
  // async findByLoginOrEmailField(loginOrEmail: string) {}

  async delete(id: string): Promise<any> {
    const query: string = `DELETE FROM users WHERE id=$1`;

    const result = await this.dataSource.query(query, [id]);

    const rowsDeleted = result[1];

    return rowsDeleted > 0;
  }
}
