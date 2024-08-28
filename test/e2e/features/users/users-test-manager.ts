import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserCreateModel } from '../../../../src/features/users/api/models/input/create-user.input.model';

export class UsersTestManager {
  constructor(protected readonly app: INestApplication) {}

  // можно выносить некоторые проверки в отдельные методы для лучшей читаемости тестов
  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
    expect(createModel.lastName).toBe(responseModel.lastName);
  }

  async createUser(
    adminUsername: string,
    adminPassword: string,
    createModel: UserCreateModel,
    statusCode: number = 201,
  ) {
    return request(this.app.getHttpServer())
      .post('/api/users')
      .auth(adminUsername, adminPassword)
      .send(createModel)
      .expect(statusCode);
  }

  async deleteUser(
    userId: string,
    adminUsername: string,
    adminPassword: string,
    statusCode: number = 204,
  ) {
    return request(this.app.getHttpServer())
      .delete(`/api/users/${userId}`)
      .auth(adminUsername, adminPassword)
      .send()
      .expect(statusCode);
  }

  async getUsers(
    adminUsername,
    adminPassword,
    statusCode: number = 200,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    pageNumber: number = 1,
    pageSize: number = 10,
  ) {
    console.log('sortDirection', sortDirection);
    return request(this.app.getHttpServer())
      .get('/api/users')
      .auth(adminUsername, adminPassword)
      .query({
        sortBy,
        sortDirection,
        pageNumber,
        pageSize,
      })
      .send()
      .expect(statusCode);
  }

  // async updateUser(
  //   adminAccessToken: string,
  //   userId: string,
  //   updateModel: any,
  //   statusCode: number = 204,
  // ) {
  //   return request(this.app.getHttpServer())
  //     .put(`/api/users/${userId}`)
  //     .auth(adminAccessToken, {
  //       type: 'bearer',
  //     })
  //     .send(updateModel)
  //     .expect(statusCode);
  // }
  //
  // async login(
  //   login: string,
  //   password: string,
  // ): Promise<{ accessToken: string; refreshToken: string }> {
  //   const response = await request(this.app.getHttpServer())
  //     .post('/login')
  //     .send({ login, password })
  //     .expect(200);
  //
  //   return {
  //     accessToken: response.body.accessToken,
  //     refreshToken: response.headers['set-cookie'][0]
  //       .split('=')[1]
  //       .split(';')[0],
  //   };
  // }
}
