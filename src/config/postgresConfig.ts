import { registerAs as validatePostgresConfig } from '@nestjs/config';
import {
  IPostgresOption,
  PostgresCustomConfig,
} from '@src/database/requiredOptions.interface';
import configNamespace from './configNamespace';
import { customValidate, parseTrueValue } from './validate.util';

export default validatePostgresConfig(
  configNamespace.database.postgres,
  (): IPostgresOption => {
    const configs = {
      HOST: process.env.POSTGRES_HOST || 'localhost',
      PORT: parseInt(process.env.POSTGRES_PORT, 10),
      USER: process.env.POSTGRES_USER || 'postgres',
      PASSWORD: process.env.POSTGRES_PASSWORD || '',
      DBNAME: process.env.POSTGRES_DBNAME || 'postgres',
      CREATE_ON_START_UP: parseTrueValue(process.env.CREATE_DB_ON_STARTUP),
    };
    const validated = customValidate(PostgresCustomConfig, configs);
    return validated;
  },
);
