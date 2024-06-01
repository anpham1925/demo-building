import { ConfigService } from '@nestjs/config';
import configNamespace from '../config/configNamespace';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const advancedSourceOptions: Partial<PostgresConnectionOptions> = {
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  logger: 'advanced-console',
  logging: false,
  useUTC: true,
  installExtensions: true,
  migrations: [__dirname + '/dist/migrations/*{.ts,.js}'],
  migrationsRun: true,
  synchronize: true,
};
const namespace = configNamespace.database.postgres;

const globalConfigService: ConfigService = new ConfigService();
const generatePostgresSourceOptions = (configService?: ConfigService) => {
  const isUsingGlobal = !configService;
  const selectedConfigService = configService ?? globalConfigService;
  const basicSourceOptions: PostgresConnectionOptions = {
    type: 'postgres',
    host: selectedConfigService.get(
      isUsingGlobal ? 'POSTGRES_HOST' : `${namespace}.HOST`,
    ),
    port: selectedConfigService.get(
      isUsingGlobal ? 'POSTGRES_PORT' : `${namespace}.PORT`,
    ),
    username: selectedConfigService.get(
      isUsingGlobal ? 'POSTGRES_USER' : `${namespace}.USER`,
    ),
    password: selectedConfigService.get(
      isUsingGlobal ? 'POSTGRES_PASSWORD' : `${namespace}.PASSWORD`,
    ),
    database: selectedConfigService.get(
      isUsingGlobal ? 'POSTGRES_DBNAME' : `${namespace}.DBNAME`,
    ),
  };

  return { basicSourceOptions, advancedSourceOptions };
};
export const databaseProviders = [
  {
    //postgres
    inject: [ConfigService],
    provide: configNamespace.database.postgres,
    useFactory: async (configService: ConfigService) => {
      const { basicSourceOptions, advancedSourceOptions } =
        generatePostgresSourceOptions(configService);
      const createDBOnStartup = configService.get<boolean>(
        `${namespace}.CREATE_ON_START_UP`,
      );

      if (createDBOnStartup) {
        await createDBIfNotExists(basicSourceOptions);
      }
      const dataSource = new DataSource({
        ...basicSourceOptions,
        ...advancedSourceOptions,
      });
      return dataSource.initialize();
    },
  },
];

const createDBIfNotExists = async (
  basicSourceOptions: PostgresConnectionOptions,
): Promise<void> => {
  const dataSource = new DataSource({
    ...basicSourceOptions,
    database: 'postgres',
  });
  await dataSource.initialize();

  await dataSource
    .createQueryRunner()
    .createDatabase(basicSourceOptions.database, true);

  await dataSource.destroy();
};
