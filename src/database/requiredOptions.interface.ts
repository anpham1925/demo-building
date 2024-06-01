import { IsBoolean, IsNumber, IsString } from 'class-validator';

export interface IDatabaseConfig {
  HOST: string;
  PORT: number;
  DBNAME: string;
  USER: string;
  PASSWORD: string;
  CREATE_ON_START_UP?: boolean;
}

export interface IPostgresOption extends IDatabaseConfig {}

export class PostgresCustomConfig implements IDatabaseConfig {
  @IsString()
  HOST: string;

  @IsNumber()
  PORT: number;

  @IsString()
  DBNAME: string;

  @IsString()
  USER: string;

  @IsString()
  PASSWORD: string;

  @IsBoolean()
  CREATE_ON_START_UP?: boolean;
}
