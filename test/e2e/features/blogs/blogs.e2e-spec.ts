import { INestApplication } from '@nestjs/common';
import { initSettings } from '../../utils/init-settings';
import { BlogsTestManager } from './blogs-test-manager';
import { deleteAllData } from '../../utils/delete-all-data';
import { BlogCreateModel } from '../../../../src/features/content/blogs/api/models/input/create-blog.input.model';

const TEST_ADMIN_CREDENTIALS = {
  login: 'admin',
  password: 'qwerty',
};

describe('blogs /sa', () => {
  let app: INestApplication;
  let blogTestManger: BlogsTestManager;

  beforeAll(async () => {
    await initSettings();

    app = expect.getState().app;

    blogTestManger = expect.getState().blogTestManager;

    if (!app) {
      throw new Error('Application failed to initialize');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(expect.getState().dataSource);
  });

  it('should create blog', async () => {
    const createModel: BlogCreateModel = {
      name: 'name123',
      description: 'description123',
      websiteUrl: 'http://example123.com',
    };

    console.log('blogTestManger', blogTestManger);

    await blogTestManger.createBlog(
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
      createModel,
      201,
    );
  });
});
