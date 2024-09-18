import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersPostgresqlQueryRepository {
  constructor() {}

  // async getAll(pagination: PaginationWithSearchLoginAndEmailTerm): Promise<> {}

  async findById(id: string): Promise<any> {}

  // // TODO: not sure about name
  async findAuthenticatedUserById(id: string): Promise<any> {}
  //
  // // TODO: change type any
  // private async _getResult(): Promise<> {}
}
