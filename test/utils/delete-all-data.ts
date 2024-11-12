import { DataSource } from 'typeorm';

export const deleteAllData = async (dataSource: DataSource) => {
  await dataSource.query(`
    -- Disable foreign key constraints and other restrictions for data truncation
    SET session_replication_role = 'replica';
    
    -- Start a transaction
    BEGIN;
    
    -- Truncate all tables in the 'public' schema
    DO $$ 
    DECLARE
        r RECORD;  -- Declare a RECORD type variable to store table names
    BEGIN
        -- Loop through all tables in the 'public' schema
        FOR r IN (SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public') LOOP
            -- Execute TRUNCATE command for each table with CASCADE
            EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE;';
        END LOOP;
    END $$;
    
    -- Re-enable foreign key constraints and other restrictions
    SET session_replication_role = 'origin';
    
    -- Commit the transaction
    COMMIT;
  `);
};

// export const deleteAllData = async (dataSource: DataSource) => {
//   // const entities = dataSource.entityMetadatas;
//   // console.log(entities);
//   // Сначала очистим зависимые таблицы (EmailConfirmation, PasswordRecovery)
//   // const dependentTables = ['email_confirmation', 'password_recovery'];
//   //
//   // for (const table of dependentTables) {
//   //   const repository = dataSource.getRepository(table);
//   //   await repository.clear();
//   // }
//   //
//   // // Теперь можно очистить таблицу User
//   // const userRepository = dataSource.getRepository('User');
//   // await userRepository.clear();
//
//   const tables: string[] = [
//     'comment_likes',
//     'comments',
//     'post_likes',
//     'post',
//     'blog',
//     `public."user"`,
//     'device',
//     'password_recovery',
//     'email_confirmation',
//   ];
//
//   for (const table of tables) {
//     await dataSource.query(`DELETE FROM ${table}`);
//   }
// };
