import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserOutputModelMapper } from '../../api/models/output/user.output.model';

@Injectable()
export class UsersPostgresqlQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  // async getAll(pagination: PaginationWithSearchLoginAndEmailTerm): Promise<> {}

  async findById(id: string): Promise<any> {
    const query: string = `SELECT * FROM users WHERE id=$1`;

    const result = await this.dataSource.query(query, [id]);
    return result.length > 0 ? UserOutputModelMapper(result[0]) : null;
  }

  // // TODO: not sure about name
  async findAuthenticatedUserById(id: string): Promise<any> {}
  //
  // // TODO: change type any
  // private async _getResult(): Promise<> {}
}
