import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import validatePostgresConfig from '@src/config/postgresConfig';
import { databaseProviders } from './database.provider';

@Module({
  imports: [ConfigModule.forFeature(validatePostgresConfig)],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
