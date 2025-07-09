import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class DatabaseNeoBrustalismService {
  constructor(
    @InjectDataSource() private defaultDataSource: DataSource,
    // @InjectDataSource('analytics') private analyticsDataSource: DataSource,
  ) { }

  // Getter cho default database
  getDefaultDataSource(): DataSource {
    return this.defaultDataSource;
  }

  // Getter cho analytics database
  // getAnalyticsDataSource(): DataSource {
  //   return this.analyticsDataSource;
  // }

  // Kiểm tra kết nối
  async checkConnection(connectionName: string = 'default'): Promise<boolean> {
    try {
      // const dataSource = connectionName === 'analytics' 
      //   ? this.analyticsDataSource 
      //   : this.defaultDataSource;

      const dataSource = this.defaultDataSource;

      await dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      console.error(`Database connection error (${connectionName}):`, error);
      return false;
    }
  }

  // Tạo transaction cho default database
  async createDefaultTransaction(): Promise<QueryRunner> {
    const queryRunner = this.defaultDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  // Tạo transaction cho analytics database
  // async createAnalyticsTransaction(): Promise<QueryRunner> {
  //   const queryRunner = this.analyticsDataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   return queryRunner;
  // }

  // Commit transaction
  async commitTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.release();
  }

  // Rollback transaction
  async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }

  // Thực hiện raw query
  async executeRawQuery(
    query: string,
    parameters?: any[],
    connectionName: string = 'default'
  ): Promise<any> {
    // const dataSource = connectionName === 'analytics'
    //   ? this.analyticsDataSource
    //   : this.defaultDataSource;

    const dataSource = this.defaultDataSource;

    return await dataSource.query(query, parameters);
  }

  // Lấy thông tin kết nối
  getDatabaseInfo(connectionName: string = 'default'): any {
    // const dataSource = connectionName === 'analytics'
    //   ? this.analyticsDataSource
    //   : this.defaultDataSource;

    const dataSource = this.defaultDataSource;

    return {
      isConnected: dataSource.isInitialized,
      databaseName: dataSource.options.database,
      //@ts-ignore
      host: dataSource.options.host,
      type: dataSource.options.type,
    };
  }
}