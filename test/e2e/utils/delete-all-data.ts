import { DataSource } from 'typeorm';

export const deleteAllData = async (dataSource: DataSource) => {
  // const entities = dataSource.entityMetadatas;
  // console.log(entities);
  // Сначала очистим зависимые таблицы (EmailConfirmation, PasswordRecovery)
  // const dependentTables = ['email_confirmation', 'password_recovery'];
  //
  // for (const table of dependentTables) {
  //   const repository = dataSource.getRepository(table);
  //   await repository.clear();
  // }
  //
  // // Теперь можно очистить таблицу User
  // const userRepository = dataSource.getRepository('User');
  // await userRepository.clear();

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
    await dataSource.query(`DELETE FROM ${table}`);
  }
};
