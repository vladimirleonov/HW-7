import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(private readonly dataSource: DataSource) {}

  async deleteAllData() {
    const tables: string[] = [
      'comment_likes',
      'comments',
      'post_likes',
      'posts',
      'blogs',
      `public."user"`,
      'device',
      'password_recovery',
      'email_confirmation',
    ];

    for (const table of tables) {
      await this.dataSource.query(`DELETE FROM ${table}`);
    }

    // await this.dataSource.query(`SET session_replication_role = 'origin';`);
  }
}
