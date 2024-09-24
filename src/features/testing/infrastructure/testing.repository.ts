import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(private readonly dataSource: DataSource) {}

  async deleteAllData() {
    const tables: string[] = [
      'email_confirmation',
      'password_recovery',
      'device',
      'users',
    ];

    for (const table of tables) {
      await this.dataSource.query(`DELETE FROM ${table}`);
    }

    await this.dataSource.query(`SET session_replication_role = 'origin';`);
  }
}
