import request from 'supertest';
import { BlogCreateModel } from '../../../../src/features/content/blogs/api/models/input/create-blog.input.model';
import { INestApplication } from '@nestjs/common';

export class BlogsTestManager {
  constructor(protected readonly app: INestApplication) {}

  // you can take out some methods for better readability
  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.id).toBe(responseModel.id);
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.description).toBe(responseModel.description);
  }

  async createBlog(
    adminUsername: string,
    adminPassword: string,
    createModel: BlogCreateModel,
    statusCode: number = 201,
  ) {
    return request(this.app.getHttpServer())
      .post('/api/sa/blogs')
      .auth(adminUsername, adminPassword)
      .send(createModel)
      .expect(statusCode);
  }
}
