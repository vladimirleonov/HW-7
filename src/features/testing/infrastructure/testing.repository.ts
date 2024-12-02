import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(private readonly dataSource: DataSource) {}

  async deleteAllData() {
    await this.dataSource.query(`
    -- Disable foreign key constraints and other restrictions for data truncation
    SET session_replication_role = 'replica';
    
    -- Start a transaction
    BEGIN;
    
    -- Truncate all tables in the 'public' schema, excluding 'migrations' table
    DO $$ 
    DECLARE
        r RECORD;  -- Declare a RECORD type variable to store table names
    BEGIN
        -- Loop through all tables in the 'public' schema
        FOR r IN (SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename != 'migrations') LOOP
            -- Execute TRUNCATE command for each table with CASCADE
            EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE;';
        END LOOP;
    END $$;
    
    -- Re-enable foreign key constraints and other restrictions
    SET session_replication_role = 'origin';
    
    -- Commit the transaction
    COMMIT;
  `);

    // console.log('in repo delete');
    // const tables: string[] = [
    //   'comment_like',
    //   'comment',
    //   'post_like',
    //   'post',
    //   'blog',
    //   `public."user"`,
    //   'device',
    //   'password_recovery',
    //   'email_confirmation',
    //   'game',
    //   'player',
    //   'answer',
    //   'question',
    //   'game_question',
    // ];
    //
    // for (const table of tables) {
    //   await this.dataSource.query(`DELETE FROM ${table}`);
    // }

    // await this.dataSource.query(`SET session_replication_role = 'origin';`);
  }
}
