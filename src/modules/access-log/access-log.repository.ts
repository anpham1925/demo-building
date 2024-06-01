import { Inject, Injectable } from '@nestjs/common';
import configNamespace from '@src/config/configNamespace';
import { DataSource, Repository } from 'typeorm';
import { AccessLog } from './access-log.entity';

@Injectable()
export class AccessLogRepository extends Repository<AccessLog> {
  constructor(
    @Inject(configNamespace.database.postgres)
    private dataSource: DataSource,
  ) {
    super(AccessLog, dataSource.createEntityManager());
  }
}
